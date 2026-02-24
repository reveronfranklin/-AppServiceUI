import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { Subject, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { GeneralService } from 'src/app/services/general.service';
import { CotizacionesListService } from '../../../../services/cotizaciones/cotizaciones-list.service';
import { TasaPreferencialService } from '../../../../services/tasa-preferencial.service';
import { ProductoService } from '../../../../services/producto.service';
import { CondicionesPagoService } from 'src/app/services/condiciones-pago.service';
import { CotizacionCalculatorService } from 'src/app/services/cotizacion-calculator.service';
import { CotizacionFormService } from 'src/app/services/cotizacion-form.service';

import { AppGeneralQuotesGetDto } from '../../../../models/app-general-quotes-get-dto';
import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { AppProductsGetDto } from 'src/app/models/app-products-get-dto';
import { AppDetailQuotesCreateDto } from '../../../../models/app-detail-quotes-create-dto';
import { AppDetailQuotesUpdateDto } from '../../../../models/app-detail-quotes-update-dto';
import { BuscadorProductosPage } from '../buscador-productos/buscador-productos.page';
import { BuscadorUnidadesComponent } from '../../../../components/buscador-unidades/buscador-unidades.component';
import { PrecioDto } from 'src/app/interfaces/precio';

@Component({
  selector: 'app-edit-refactor',
  templateUrl: './edit-refactor.page.html',
  styleUrls: ['./edit-refactor.page.scss'],
})
export class EditRefactorPage implements OnInit, OnDestroy {
  @Input() cotizacion: AppGeneralQuotesGetDto;
  public item: AppDetailQuotesGetDto;

  operacion: number;
  public editable: boolean;
  form: FormGroup;
  tituloUi: string;
  
  public isBs: boolean = false;
  public porDebajoDeCantidadMinima: boolean = false;
  public isDolar: boolean = true;
  public btnUmDisabled: boolean = true;
  public tasa: number;
  public uiTasa: number;
  public colorToolbar: string = 'primary';
  public requiereAprobacionPrecio: boolean = false;
  public solicitarPrecio: boolean = false;
  public mensajeBotonSolicitarPrecio: string = '';
  public concesion: number = 0;
  public concesionString: string = '';
  
  public uiImageLink: string = '';
  public uiNombreProductoInCard: string = '';
  public decripcionProductionUnit: string = '';
  public descripcionSalesUnit: string = '';
  public newPrecioMasFlete: number = 0;
  public flete: number = 0;
  public unitPriceBaseProduction: number = 0;
  public precioMaximo: number = 0;
  public calculoId: number = 0;
  public showLoading: boolean = false;
  public subCategoryid: number;
  public requiereDatosEntrada: boolean = false;
  public buscandoPrecio: boolean = false;
  public mensaje: string = '';
  public cantidadPorUnidadProduccion: number = 0;
  
  public appSubcategoryGetDto: any[] = [];
  public listCondicionPagoDto: any[] = [];
  public appProduct: AppProductsGetDto;
  public condicionPagoCodigo: number = 0;
  public uiIdProducto: number = 0;
  public uiIdUnidad: number = 0;
  public appProductConversionGetDto: any;
  
  public salidas: string[] = ['A', 'B', 'C', 'D'];
  public tipoForma: string[] = ['Regular', 'Irregular'];

  private subjectKeyUp = new Subject<any>();
  private subscriptions: Subscription[] = [];
  private usuarioConectado: string;

  constructor(
    private router: Router,
    public generalService: GeneralService,
    public cotizacionesListService: CotizacionesListService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private tasaPreferencialService: TasaPreferencialService,
    private productoService: ProductoService,
    private condicionesPago: CondicionesPagoService,
    private formService: CotizacionFormService,
    private calculatorService: CotizacionCalculatorService
  ) {
    this.form = this.formService.buildForm();
  }

  async ngOnInit() {
    this.usuarioConectado = this.generalService.GetUsuario().user;
    
    this.subscriptions.push(
      this.cotizacionesListService.cotizacion$.subscribe(cot => {
        this.cotizacion = cot;
        if (this.cotizacion) this.editable = this.cotizacion.appStatusQuoteGetDto.editable;
      })
    );

    this.subscriptions.push(
      this.tasaPreferencialService.tasa$.subscribe(t => { 
        this.tasa = t; 
        this.uiTasa = t; 
      })
    );

    this.subscriptions.push(
      this.subjectKeyUp.pipe(debounceTime(1000)).subscribe(d => this.onRecalcular(d))
    );

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.operacion = nav.extras.state.operacion;
      if (this.operacion === 1) {
        this.item = nav.extras.state.item;
        this.appProduct = nav.extras.state.producto || this.item.appProductsGetDto;
        this.item.appProductsGetDto = this.appProduct;
      }
    }

    this.initializeMode();
    await this.loadInitialData();
    this.showData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private initializeMode() {
    if (this.operacion === 0) {
      this.item = new AppDetailQuotesGetDto();
      this.item.statusAprobacionDto = { 
        flagAprobado: true,
        flagCerrado: false,
        valorVentaAprobar: 0,
        valorVentaAprobarUsd: 0,
        aprobado: true,
        color: 'primary',
        statusString: 'APROBADO',
        precioEstimacion: 0,
      };
      this.uiImageLink = this.generalService.noImageUrl();
      this.uiNombreProductoInCard = '?';
    }
    this.tituloUi = this.operacion === 0 ? 'Añadir Detalle a Cotización' : 'Detalle de Cotización';
  }

  private async loadInitialData() {
    this.condicionesPago.GetAllCondicionPago({ codigo: 0 }).subscribe(resp => {
      this.listCondicionPagoDto = resp.data;
      if (this.cotizacion) {
        this.condicionPagoCodigo = this.cotizacion.idCondPago;
        this.form.get('condicionPago').setValue(this.condicionPagoCodigo);
      }
    });

    const subcategoryAll = JSON.parse(localStorage.getItem('listSubcategoria')) || [];
    this.appSubcategoryGetDto = subcategoryAll
      .sort((a, b) => a.description < b.description ? -1 : 1)
      .filter(x => x.active === true);
      
    await this.tasaPreferencialService.GetTasa().toPromise().then(resp => {
      this.tasaPreferencialService.tasa$.next(resp.data.tasa);
    });
  }

  showData() {
    this.formService.mapDataToForm(this.form, this.item, this.cotizacion, this.operacion);
    
    if (this.operacion === 1 && this.appProduct) {
      this.uiImageLink = this.appProduct.link;
      this.uiNombreProductoInCard = this.appProduct.description1 + ' ' + (this.appProduct.description2 || '');
      this.decripcionProductionUnit = this.appProduct.productionUnitGetDto?.description1;
      this.descripcionSalesUnit = this.item.appUnitsGetDto?.description1;
      this.unitPriceBaseProduction = this.item.unitPriceBaseProduction;
      this.flete = this.item.flete;
      this.calculoId = this.item.calculoId;
      this.btnUmDisabled = false;
      this.subCategoryid = this.appProduct.appSubCategoryId;
      this.requiereDatosEntrada = this.appProduct.requiereDatosEntrada;
    }

    this.setColorToolbar();
  }

  setPrecioMasFlete() {
    const raw = localStorage.getItem('precio-mas-flete');
    if (!raw || raw === 'undefined') {
      this.resetPricingProperties();
    } else {
      const precio: PrecioDto = JSON.parse(raw);
      this.newPrecioMasFlete = +(precio.precioMasFlete || 0).toFixed(2);
      this.flete = precio.flete || 0;
      this.unitPriceBaseProduction = precio.unitPriceBaseProduction || 0;
      this.calculoId = precio.calculoId || 0;
      this.precioMaximo = precio.precioMaximo || 0;
      this.porDebajoDeCantidadMinima = precio.porDebajoDeCantidadMinima || false;
    }

    if (this.item?.statusAprobacionDto?.aprobado && this.item?.estimada) {
      this.unitPriceBaseProduction = this.item.statusAprobacionDto.valorVentaAprobarUsd;
      this.newPrecioMasFlete = +this.unitPriceBaseProduction.toFixed(2);
    } else if ((this.appProduct?.requiereEstimacion) || this.porDebajoDeCantidadMinima) {
      this.resetPricingProperties();
    }
  }

  private resetPricingProperties() {
    this.newPrecioMasFlete = 0;
    this.flete = 0;
    this.unitPriceBaseProduction = 0;
    this.calculoId = 0;
    this.precioMaximo = 0;
    this.porDebajoDeCantidadMinima = false;
  }

  setColorToolbar() {
    this.setPrecioMasFlete();
    const result = this.calculatorService.checkAprobacion({
      newPrecioMasFlete: this.newPrecioMasFlete,
      precioUsd: this.form.get('precioUsd').value,
      requiereEstimacion: this.appProduct?.requiereEstimacion ?? false,
      porDebajoDeCantidadMinima: this.porDebajoDeCantidadMinima,
      idEstatus: this.item?.idEstatus || 0,
      aprobado: this.item?.statusAprobacionDto?.aprobado ?? false,
      flagCerrado: this.item?.statusAprobacionDto?.flagCerrado ?? false,
      operacion: this.operacion,
      isBs: this.isBs
    });

    this.requiereAprobacionPrecio = result.requiereAprobacion;
    this.colorToolbar = result.color;
    this.solicitarPrecio = result.solicitarPrecio;
    this.mensajeBotonSolicitarPrecio = result.mensajeBoton;
    
    this.calculateConcession();
  }

  private calculateConcession() {
    this.concesionString = '';
    const lista = Number(this.newPrecioMasFlete);
    const precioUsd = this.form.get('precioUsd').value;
    if (lista !== 0) {
      this.concesion = ((lista - precioUsd) / lista) * 100;
      if (this.concesion < 0) this.concesionString = `+${(this.concesion * -1).toFixed(2)}% de sobre margen`;
      else if (this.concesion > 0) this.concesionString = `-${this.concesion.toFixed(2)}% de descuento`;
      else this.concesionString = '0% de descuento';
    }
  }

  async onRecalcular(origen: string) {
    if (!this.appProduct) return;
    
    this.mensaje = 'Recalculando...';
    if (this.appProduct.tipoCalculo === 4 || this.appProduct.tipoCalculo === 6) {
      await this.recalculoPrecioPorProductoCantidadLargoAncho();
    } else if (this.appProduct.tipoCalculo === 1) {
      this.recalculoRequiereEntradaLargoAncho();
    } else {
      this.recalculoPorRango();
    }
    this.mensaje = '';
    this.setColorToolbar();
  }

  async recalculoPrecioPorProductoCantidadLargoAncho() {
    const filter = {
      idMunicipio: this.cotizacion.idMunicipio,
      appProuctId: this.appProduct.id,
      cantidad: this.form.get('cantidadSolicitada').value,
      largo: this.form.get('medidaBasica').value,
      ancho: this.form.get('medidaOpuesta').value,
      appDetailQuotesId: this.item.id || 0,
      unidadId: this.uiIdUnidad,
      condicionDePago: this.form.get('condicionPago').value,
      ordenAnterior: this.form.get('ordenAnterior').value,
    };

    try {
      this.buscandoPrecio = true;
      const resp: any = await this.productoService.getPrice(filter).toPromise();
      this.buscandoPrecio = false;
      
      this.updateStateFromPriceResponse(resp.data);
      this.form.get('precio').setValue(this.newPrecioMasFlete);
      this.updateTotals();
    } catch (err) {
      this.buscandoPrecio = false;
      this.generalService.presentToast('Error al obtener precio', 'danger');
    }
  }

  private updateStateFromPriceResponse(data: any) {
    const precioDto: PrecioDto = {
      unitPriceBaseProduction: data.precio,
      precioMasFlete: data.precioMasFlete,
      calculoId: data.calculoId,
      flete: data.flete,
      porcFlete: data.porcFlete,
      precioMaximo: data.precioMaximo,
      precioMaximoMasFlete: data.precioMaximoMasFlete,
      porDebajoDeCantidadMinima: data.porDebajoDeCantidadMinima,
    };
    localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

    this.calculoId = data.calculoId;
    this.unitPriceBaseProduction = data.precio;
    this.precioMaximo = data.precioMaximo;
    this.newPrecioMasFlete = data.precioMasFlete;
    this.porDebajoDeCantidadMinima = data.porDebajoDeCantidadMinima;

    this.form.get('cantidad').setValue(data.cantidadConvertida);
    this.form.get('precioUsd').setValue(data.precioMasFlete);
    this.form.get('totalUsd').setValue(data.precioMasFlete * data.cantidadConvertida);
  }

  recalculoRequiereEntradaLargoAncho() {
    const calc = this.calculatorService.calculaConversion(
      this.form.get('cantidadSolicitada').value,
      this.form.get('medidaBasica').value,
      this.form.get('medidaOpuesta').value
    );

    this.cantidadPorUnidadProduccion = calc.resulCantidad;
    const qty = this.form.get('cantidadSolicitada').value / this.cantidadPorUnidadProduccion;
    this.form.get('cantidad').setValue(qty);

    if (this.appProduct.appPriceDto?.length > 0) {
      const precio = this.calculatorService.buscarPrecioPorRango(this.appProduct.appPriceDto, qty);
      this.unitPriceBaseProduction = precio;
      this.precioMaximo = this.calculatorService.buscarPrecioMaximoPorRango(this.appProduct.appPriceDto, qty);
    }

    if (this.cotizacion.porcFlete > 0) {
      this.flete = (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;
    }

    const precioMasFlete = this.unitPriceBaseProduction + this.flete;
    localStorage.setItem('precio-mas-flete', JSON.stringify({
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      precioMasFlete: precioMasFlete,
      flete: this.flete,
      precioMaximo: this.precioMaximo,
      porDebajoDeCantidadMinima: false
    }));

    this.form.get('precio').setValue(precioMasFlete);
    this.updateTotals();
  }

  recalculoPorRango() {
    const qty = this.calculatorService.calculoConversionGenerico(
      this.appProductConversionGetDto,
      this.form.get('cantidadSolicitada').value
    );

    this.form.get('cantidad').setValue(qty);
    this.cantidadPorUnidadProduccion = qty;

    if (this.appProduct.appPriceDto?.length > 0) {
      const precio = this.calculatorService.buscarPrecioPorRango(this.appProduct.appPriceDto, qty);
      this.unitPriceBaseProduction = precio;
      this.precioMaximo = this.calculatorService.buscarPrecioMaximoPorRango(this.appProduct.appPriceDto, qty);
    }

    let porcFlete = this.cotizacion.porcFlete;
    if (this.appProduct.porcFlete > 0) porcFlete = this.appProduct.porcFlete;

    this.flete = (this.unitPriceBaseProduction * porcFlete) / 100;
    const precioMasFlete = this.unitPriceBaseProduction + this.flete;

    localStorage.setItem('precio-mas-flete', JSON.stringify({
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      precioMasFlete: precioMasFlete,
      flete: this.flete,
      precioMaximo: this.precioMaximo,
      porDebajoDeCantidadMinima: false
    }));

    this.form.get('precio').setValue(precioMasFlete);
    this.updateTotals();
  }

  private updateTotals() {
    const qty = this.form.get('cantidad').value;
    const precio = this.form.get('precio').value;
    const precioUsd = this.form.get('precioUsd').value;

    this.form.get('total').setValue(qty * precio);
    this.form.get('totalUsd').setValue(qty * precioUsd);
    
    if (this.isDolar && this.tasa > 0) {
      this.form.get('precio').setValue(precioUsd * this.tasa);
      this.form.get('total').setValue(qty * this.form.get('precio').value);
    }
  }

  onSave(eliminarSolicitud: boolean) {
    if (this.operacion === 0) this.onInsert();
    else this.onUpdate(eliminarSolicitud);
  }

  async onInsert() {
    const dto = this.formService.mapFormToCreateDto(this.form, this.cotizacion, this.appProduct, this.uiIdProducto, this.uiIdUnidad, this.calculoId, this.unitPriceBaseProduction, this.precioMaximo, this.solicitarPrecio, this.usuarioConectado);
    this.showLoading = true;
    this.cotizacionesListService.InsertDetalleCotizacion(dto).subscribe(res => {
      this.showLoading = false;
      if (res.meta.isValid) {
        this.generalService.presentToast(res.meta.message, 'success');
        this.goListDetalleCotizacion();
      } else {
        this.generalService.presentToast(res.meta.message, 'danger');
      }
    });
  }

  async onUpdate(eliminarSolicitud: boolean) {
    const dto = this.formService.mapFormToUpdateDto(this.form, this.item, this.cotizacion, this.uiIdProducto, this.uiIdUnidad, this.calculoId, this.unitPriceBaseProduction, this.precioMaximo, this.solicitarPrecio, this.usuarioConectado, eliminarSolicitud);
    this.showLoading = true;
    this.cotizacionesListService.UpdateDetalleCotizacion(dto).subscribe(res => {
      this.showLoading = false;
      if (res.meta.isValid) {
        this.generalService.presentToast(res.meta.message, 'success');
        this.goListDetalleCotizacion();
      } else {
        this.generalService.presentToast(res.meta.message, 'danger');
      }
    });
  }

  async onBuscarProducto() {
    const modal = await this.modalCtrl.create({
      component: BuscadorProductosPage,
      cssClass: 'modal-amplio',
      componentProps: {
        userConectado: this.usuarioConectado,
        subcategoryId: this.subCategoryid,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.isValid) {
      this.handleProductSelection(data);
    }
  }

  private handleProductSelection(data: any) {
    this.appProduct = data.appProduct;
    this.uiIdProducto = data.id;
    this.uiImageLink = data.link;
    this.uiNombreProductoInCard = this.appProduct.description1 + ' ' + (this.appProduct.description2 || '');
    this.btnUmDisabled = false;
    this.decripcionProductionUnit = data.decripcionProductionUnit;
    this.subCategoryid = this.appProduct.appSubCategoryId;
    this.requiereDatosEntrada = this.appProduct.requiereDatosEntrada;

    this.form.get('producto').setValue(data.code);
    this.form.get('nombreComercialProducto').setValue(data.descripcion);
    
    // Set first conversion as default UM
    if (this.appProduct.conversiones?.length > 0) {
      const conv = this.appProduct.conversiones[0];
      this.form.get('unidad').setValue(conv.appUnitsAlternativaDescription);
      this.uiIdUnidad = conv.appUnitsIdAlternativa;
      this.descripcionSalesUnit = conv.appUnitsAlternativaDescription;
    }
    
    this.onRecalcular('onBuscarProducto');
  }

  async onBuscarUnidad() {
    const modal = await this.modalCtrl.create({
      component: BuscadorUnidadesComponent,
      componentProps: {
        userConectado: this.usuarioConectado,
        producto: this.uiIdProducto,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.form.get('unidad').setValue(data.descripcion);
      this.uiIdUnidad = data.appProductConversion.appUnitsIdAlternativa;
      this.descripcionSalesUnit = data.descripcion;
      this.onRecalcular('onBuscarUnidad');
    }
  }

  // Event handlers
  cantidadSolicitadaChanged(val: number) { this.subjectKeyUp.next('qty'); }
  medidaBasicaChanged(val: number) { this.subjectKeyUp.next('base'); }
  medidaOpuestaChanged(val: number) { this.subjectKeyUp.next('opp'); }
  precioUsdChanged(val: number) { this.setColorToolbar(); }
  
  onChangeCondicionPago(e: any) { this.condicionPagoCodigo = e.target.value; this.setColorToolbar(); }
  onChangeSubCategoriaId(e: any) { this.subCategoryid = e.detail.value; }
  onChangeSalida(e: any) {}
  onChangeTipoForma(e: any) {}

  enviarAprobacion() {
    if (this.form.get('obsSolicitud').value === '') {
      this.generalService.presentToast('Indique observación de Solicitud', 'danger');
      return;
    }
    this.solicitarPrecio = true;
    this.onSave(true);
  }

  limpiarOrdenAnterior() {
    this.formService.mapDataToForm(this.form, new AppDetailQuotesGetDto(), this.cotizacion, 0);
    this.appProduct = null;
    this.uiIdProducto = 0;
    this.btnUmDisabled = true;
  }

  goListDetalleCotizacion() {
    this.router.navigate(['/menu/list-detalle-cotizacion']);
  }

  imprimirCotiza(cot: any) {
    this.cotizacionesListService.cotizacion$.next(cot);
    this.router.navigate(['/menu/imprimir-cotizacion']);
  }
}
