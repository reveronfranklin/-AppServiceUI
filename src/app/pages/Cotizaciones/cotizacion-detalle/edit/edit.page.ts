import { AlertController, ModalController } from '@ionic/angular';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

import { CotizacionesListService } from '../../../../services/cotizaciones/cotizaciones-list.service';
import { AppGeneralQuotesGetDto } from '../../../../models/app-general-quotes-get-dto';

import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { AppDetailQuotesDeleteDto } from 'src/app/models/app-detail-quotes-delete-dto';
import { AppDetailQuotesCreateDto } from '../../../../models/app-detail-quotes-create-dto';
import { AppDetailQuotesUpdateDto } from '../../../../models/app-detail-quotes-update-dto';

import { BuscadorUnidadesPage } from '../buscador-unidades/buscador-unidades.page';

import { Subject } from 'rxjs';
import { TasaPreferencialService } from '../../../../services/tasa-preferencial.service';

import { AppConversionUnitGenericCreateDto } from '../../../../models/app-conversion-unit-generic-create-dto';

import { AppSubcategoryGetDto } from '../../../../models/app-subcategory-get-dto';
import { ProductoService } from '../../../../services/producto.service';
import { BuscadorProductosComponent } from '../../../../components/buscador-productos/buscador-productos.component';
import { BuscadorUnidadesComponent } from '../../../../components/buscador-unidades/buscador-unidades.component';
import { ParametrosMaquinas } from '../../../../models/ParametrosMaquina.dto';
import {
  Conversion,
  ConversionUnidadesMetrosCuadrados,
} from 'src/app/models/conversion';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { AppProductsGetDto } from 'src/app/models/app-products-get-dto';
import { ResultConversionUnidadesMetrosCuadrados } from 'src/app/models/result-conversion-unidades-metros-cuadrados-dto';
import { AppProductConversionGetDto } from 'src/app/models/app-product-conversion-get-dto';
import { AppProductConversionFilter } from 'src/app/interfaces/app-product-conversion-filter';
import { CondicionesPagoService } from 'src/app/services/condiciones-pago.service';
import { CondicionPagoQueryFilter } from 'src/app/interfaces/condicion-pago-query-filter';
import { CondicionPagoDto } from 'src/app/models/CondicionPagoDto';
import { PrecioDto } from 'src/app/interfaces/precio';
import { BuscadorProductosPage } from '../buscador-productos/buscador-productos.page';
import { AppSolicitudAprobacionService } from 'src/app/services/app-solicitud-aprobacion.service';
import {
  CotizacionDetalleBusinessRulesService,
  ParametrosAprobacionPrecio,
  ResultadoAprobacionPrecio,
} from 'src/app/services/cotizacion-detalle-business-rules.service';
import { PrecioMasFleteStorageService } from 'src/app/services/precio-mas-flete-storage.service';
import { DocumentacionFuncionalDetalleCotizacionComponent } from './documentacion-funcional-detalle-cotizacion/documentacion-funcional-detalle-cotizacion.component';
import { AppSolicitudAprobacion } from 'src/app/models/app-solicitud-aprobacion.model';

interface DetalleCotizacionListItem extends AppDetailQuotesGetDto {
  precioBaseConFlete: number;
  porcentajeSobreprecio: number;
  puedeEnviarAprobacionPorSobreprecio: boolean;
  mostrarStatusAprobacionPrecio: boolean;
  statusAprobacionColor: string;
  statusSobreprecioTexto: string;
  statusSobreprecioColor: string;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
  @Input() cotizacion: AppGeneralQuotesGetDto;
  public item: AppDetailQuotesGetDto;
  public detalleItems: DetalleCotizacionListItem[] = [];
  public detalleSeleccionadoId: number;

  operacion: number;

  public editable: boolean;
  form: FormGroup;
  tituloUi: any;

  public isBs: boolean;
  public porDebajoDeCantidadMinima: boolean;
  public isDolar: boolean;
  public btnUmDisabled: boolean;
  public btnCalculadoraDisabled: boolean;
  public tasa: number;
  public flagMascara: boolean;
  public calculadoraEnabled: boolean;
  public precioMaximo: number;
  public fleteMaximo: number;
  public porcMaximoSobrePrecio: number;
  public concesion: number;
  public concesionString: string;
  salidas: string[];
  tipoForma: string[];
  colorToolbar = 'primary';

  requiereAprobacionPrecio: boolean;

  solicitarPrecio: boolean;

  ultimoPrecioUsd: number;

  appSubcategoryGetDto: AppSubcategoryGetDto[] = [];
  condicionPagoQueryFilter: CondicionPagoQueryFilter;
  condicionPagoDto: CondicionPagoDto;
  listCondicionPagoDto: CondicionPagoDto[] = [];
  public condicionPagoCodigo: number = 0;

  public precioPorUnidad: number;
  public cantidadPorUnidad: number;
  public optionsMask: any;
  public mensaje: string;
  public uiId: any;
  public uiIdProducto: any;
  public uiIdUnidad: any;
  public uiUsuarioConectado: any;
  public uiUnitPriceConverted: any;
  public unitPriceBaseProduction: number;
  public flete: number;
  public newPrecioMasFlete: number;
  public uiTasa: any;
  public uiImageLink: string;
  public uiNombreProductoInCard: string;
  public decripcionProductionUnit: string;
  public descripcionSalesUnit: string;
  public cantidadPorUnidadProduccion: number;
  public showLoading: boolean;
  public subCategoryid: number;
  public requiereDatosEntrada: boolean;
  public buscandoPrecio: boolean;
  public longituDecimal: string;
  public mostrarEnDesarrollo: boolean;
  public mensajeBotonSolicitarPrecio: string;
  public variables = {
    monedaBs: 'Bs',
    monedaUsd: 'US$',

    cantidad: 0,
    precisionCantidad: 0,

    precioUsd: 0,
    precisionPrecioUsd: 4,

    precio: 0,
    precisionPrecio: 2,

    total: 0,
    totalUsd: 0,

    cantidadStr: '0',
    precioStr: '0',
    precioUsdStr: '0',
    totalStr: '0',
    totalUsdStr: '0',
    permitirLectura: false,
  };
  public precio: number;
  public calculoId: number;
  public mostarOrdenAnterior: boolean;
  public appProduct: AppProductsGetDto = new AppProductsGetDto();

  private parametrosMaquinas: ParametrosMaquinas = new ParametrosMaquinas();
  private appGeneralQuotesGetDto: AppGeneralQuotesGetDto =
    new AppGeneralQuotesGetDto();
  private dtoCalculadora: AppConversionUnitGenericCreateDto =
    new AppConversionUnitGenericCreateDto();
  private appProductConversionGetDto: AppProductConversionGetDto;
  private subjectKeyUp = new Subject<any>();
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public generalService: GeneralService,
    public cotizacionesListService: CotizacionesListService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private tasaPreferencialService: TasaPreferencialService,
    private cotizacionesService: CotizacionesListService,
    private productoService: ProductoService,
    private condicionesPago: CondicionesPagoService,
    private solicitudAprobacionService: AppSolicitudAprobacionService,
    private detalleBusinessRules: CotizacionDetalleBusinessRulesService,
    private precioMasFleteStorage: PrecioMasFleteStorageService,
  ) {
    this.parametrosMaquinas = JSON.parse(
      localStorage.getItem('parametrosMaquinas'),
    );
    this.buildForm();
  }

  ngOnInit() {
    //suscribe al observable cotizacion$
    this.cotizacionesListService.cotizacion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cot) => {
        if (cot) {
          this.aplicarCotizacionEnPantalla(cot);
          if (!this.item) {
            this.inicializarDetalleActivo({});
          }
        }
      });

    this.salidas = ['A', 'B', 'C', 'D'];
    this.tipoForma = ['Regular', 'Irregular'];
    this.mostrarEnDesarrollo = true;
    this.subjectKeyUp
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe((d) => {
        this.onRecalcular(d);
      });

    const navState = this.router.getCurrentNavigation()?.extras?.state || {};
    if (navState.cotizacion) {
      this.aplicarCotizacionEnPantalla(navState.cotizacion);
    }

    this.uiId = 0;
    this.uiIdProducto = 0;
    this.uiIdUnidad = 0;
    this.uiUsuarioConectado = '';
    this.uiUnitPriceConverted = 0;
    this.uiTasa = 0;
    this.unitPriceBaseProduction = 0;
    this.flete = 0;
    this.newPrecioMasFlete = 0;
    //this.calculoId=0;
    this.variables.permitirLectura = false;
    this.btnCalculadoraDisabled = true;
    this.condicionPagoQueryFilter = {
      codigo: 0,
    };
    this.condicionesPago
      .GetAllCondicionPago(this.condicionPagoQueryFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) => {
        this.listCondicionPagoDto = resp.data;
      });

    const subcategoryAll = JSON.parse(localStorage.getItem('listSubcategoria'));
    const categorySorted = subcategoryAll.sort((a, b) =>
      a.description < b.description ? -1 : 1,
    );
    this.appSubcategoryGetDto = categorySorted.filter((x) => x.active === true);

    this.requiereDatosEntrada = false;

    this.editable = this.cotizacion?.appStatusQuoteGetDto?.editable ?? true;

    this.inicializarDetalleActivo(navState);

    if (this.operacion === 1) {
      //this.item.appProductsGetDto =this.router.getCurrentNavigation().extras.state.producto;

      this.appProduct = this.item.appProductsGetDto;
      //this.router.getCurrentNavigation().extras.state.producto;t
      // his.item.appProductsGetDto = this.appProduct;

      //this.appProduct = this.item.appProductsGetDto;
      this.calculoId = this.item.calculoId;
      this.setColorToolbar();
    }
    //suscribe al observable tasa$
    this.tasaPreferencialService.tasa$
      .pipe(takeUntil(this.destroy$))
      .subscribe((_tasa) => {
        this.tasa = _tasa;
        this.uiTasa = _tasa;
      });

    this.tasaPreferencialService
      .GetTasa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) => {
        this.tasaPreferencialService.tasa$.next(resp.data.tasa);

        this.tasa = resp.data.tasa;

        this.uiTasa = this.tasa;
      });

    this.showData();
    this.setMostrarOrdenAnterior();

    this.configuraCreateOrEdit();
  }

  ionViewDidEnter() {
    if (this.item) {
      this.showData();
      this.setMostrarOrdenAnterior();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async mostrarDocumentacionFuncional() {
    const modal = await this.modalCtrl.create({
      component: DocumentacionFuncionalDetalleCotizacionComponent,
      cssClass: 'documentacion-funcional-modal',
    });

    await modal.present();
  }

  private aplicarCotizacionEnPantalla(cotizacion: AppGeneralQuotesGetDto): void {
    this.cotizacion = cotizacion;
    this.appGeneralQuotesGetDto = cotizacion;
    this.detalleItems = (cotizacion?.appDetailQuotesGetDto || []).map((item) =>
      this.mapDetalleItem(item),
    );
  }

  private inicializarDetalleActivo(navState: any): void {
    const itemRecibido = navState?.item as AppDetailQuotesGetDto;
    const primerDetalle = this.detalleItems[0];

    if (itemRecibido?.id) {
      this.cargarDetalleEnFormulario(itemRecibido);
      return;
    }

    if (primerDetalle?.id) {
      this.cargarDetalleEnFormulario(primerDetalle);
      return;
    }

    this.nuevoProducto();
  }

  private mapDetalleItem(
    item: AppDetailQuotesGetDto,
  ): DetalleCotizacionListItem {
    const precioBaseConFlete = this.calcularPrecioBaseConFlete(item);
    const porcentajeSobreprecio =
      this.detalleBusinessRules.calcularPorcentajeSobreprecio(
        precioBaseConFlete,
        Number(item?.precioUsd || 0),
      );

    return Object.assign(item, {
      precioBaseConFlete,
      porcentajeSobreprecio,
      puedeEnviarAprobacionPorSobreprecio:
        this.detalleBusinessRules.puedeEnviarAprobacionPorSobreprecio(
          precioBaseConFlete,
          Number(item?.precioUsd || 0),
          Number(item?.porcMaximoSobrePrecio || 0),
        ),
      statusAprobacionColor:
        this.detalleBusinessRules.getColorEstatusAprobacion(
          item?.statusAprobacionDto?.statusString,
        ),
      mostrarStatusAprobacionPrecio:
        this.debeMostrarStatusAprobacionPrecio(item),
      statusSobreprecioTexto: this.getEstadoSolicitudSobreprecio(
        item?.appSolicitudAprobacionDto,
      ),
      statusSobreprecioColor: this.getColorSolicitudSobreprecio(
        item?.appSolicitudAprobacionDto,
      ),
    });
  }

  private debeMostrarStatusAprobacionPrecio(
    item: AppDetailQuotesGetDto,
  ): boolean {
    const statusString = item?.statusAprobacionDto?.statusString || '';

    if (!statusString) {
      return false;
    }

    return (
      item?.solicitarPrecio === true ||
      item?.estimada === true ||
      item?.appProductsGetDto?.requiereEstimacion === true
    );
  }

  private calcularPrecioBaseConFlete(item: AppDetailQuotesGetDto): number {
    const precioBase = Number(
      item?.unitPriceBaseProduction || item?.precioUsd || 0,
    );
    const porcFlete =
      Number(item?.porcFlete || 0) > 0
        ? Number(item.porcFlete)
        : Number(this.cotizacion?.porcFlete || 0);

    return this.detalleBusinessRules.calcularPrecioConFlete({
      precioBase,
      porcFlete,
    });
  }

  private getDetallesParaValidarAdicionar(): AppDetailQuotesGetDto[] {
    const detalles = [
      ...(this.detalleItems || []),
      ...(this.cotizacion?.appDetailQuotesGetDto || []),
    ].filter((detalle) => !!detalle && Number(detalle?.id || 0) > 0);

    const keys = new Set<string>();

    return detalles.filter((detalle) => {
      const key = `${detalle?.id || 0}|${detalle?.producto || ''}|${
        detalle?.idProducto || 0
      }`;

      if (keys.has(key)) {
        return false;
      }

      keys.add(key);
      return true;
    });
  }

  private getPermiteAdicionarDetalle(): boolean {
    const detalles = this.getDetallesParaValidarAdicionar();

    if (detalles.length === 0) {
      return true;
    }

    const permisosProducto = [
      ...detalles.map((detalle) =>
        this.getAceptaMultiplesItem(detalle?.appProductsGetDto),
      ),
    ].filter((permite) => permite !== null);

    if (permisosProducto.some((permite) => permite === false)) {
      return false;
    }

    if (permisosProducto.some((permite) => permite === true)) {
      return true;
    }

    return this.cotizacion?.permiteAdicionarDetalle === true;
  }

  private getAceptaMultiplesItem(producto: any): boolean | null {
    if (!producto) {
      return null;
    }

    const value =
      producto.aceptaMultiplesItem ??
      producto.AceptaMultiplesItem ??
      producto.aceptaMultiplesitem;

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }

    return null;
  }

  getMaximoItemsProducto(): number {
    return this.detalleBusinessRules.maximoItemsProducto;
  }

  puedeAgregarProducto(): boolean {
    return this.detalleBusinessRules.puedeAgregarProducto(
      this.detalleItems?.length || 0,
    );
  }

  puedeAdicionarNuevoDetalle(): boolean {
    return this.detalleBusinessRules.puedeAdicionarDetalle({
      cantidadItems: this.detalleItems?.length || 0,
      permiteAdicionarDetalle: this.getPermiteAdicionarDetalle(),
    });
  }

  getMensajeAdicionarDetalle(): string {
    return (
      this.detalleBusinessRules.validarAdicionarDetalle({
        cantidadItems: this.detalleItems?.length || 0,
        permiteAdicionarDetalle: this.getPermiteAdicionarDetalle(),
      }) || 'Nuevo producto'
    );
  }

  private validarAdicionarDetalle(): boolean {
    const mensaje =
      this.detalleBusinessRules.validarAdicionarDetalle({
        cantidadItems: this.detalleItems?.length || 0,
        permiteAdicionarDetalle: this.getPermiteAdicionarDetalle(),
      });

    if (!mensaje) {
      return true;
    }

    this.generalService.presentToast(mensaje, 'warning');
    return false;
  }

  private limpiarEstadoFormularioCreacion(): void {
    this.appProduct = new AppProductsGetDto();
    this.appProductConversionGetDto = null;
    this.requiereDatosEntrada = false;
    this.decripcionProductionUnit = '';
    this.descripcionSalesUnit = '';
    this.uiImageLink = '';
    this.uiNombreProductoInCard = '?';
    this.uiIdProducto = 0;
    this.uiIdUnidad = 0;
    this.ultimoPrecioUsd = 0;
    this.precio = 0;
    this.precioPorUnidad = 0;
    this.cantidadPorUnidad = 0;
    this.cantidadPorUnidadProduccion = 0;
    this.mensaje = '';
    this.concesion = 0;
    this.concesionString = '';
    this.resetPrecioMasFlete();
    this.resetEstadoAprobacionPrecio();
  }

  nuevoProducto(limpiarOrdenAnterior = false): void {
    if (!limpiarOrdenAnterior && !this.puedeAdicionarNuevoDetalle()) {
      this.validarAdicionarDetalle();
      return;
    }

    if (limpiarOrdenAnterior) {
      this.limpiarOrdenAnteriorCotizacionSinDetalles();
    }

    this.operacion = 0;
    this.detalleSeleccionadoId = 0;
    this.calculoId = 0;
    this.item = new AppDetailQuotesGetDto();
    this.item.statusAprobacionDto =
      this.detalleBusinessRules.crearEstadoAprobadoInicial();
    this.limpiarEstadoFormularioCreacion();
    this.form.reset({
      producto: '',
      nombreComercialProducto: '',
      unidad: '',
      cantidad: 0,
      precio: 0,
      total: '',
      precioUsd: 0,
      totalUsd: '',
      diasEntrega: 0,
      observaciones: '',
      obsSolicitud: '',
      obsSolicitudSobreprecio: '',
      cantidadSolicitada: 0,
      condicionPago: this.cotizacion?.idCondPago || 40,
      subCategoriaId: '',
      descripcionProducto: '',
      medidaBasica: '',
      medidaOpuesta: '',
      ordenAnterior: limpiarOrdenAnterior ? 0 : this.cotizacion?.ordenAnterior || '',
      cantidadConvertidaAlternativa: 0,
      forma: '',
      salida: '',
      presentacion: '',
      mensajeSolicitarPrecio: '',
      estimada: false,
    });
    this.configuraCreateOrEdit();
    this.setMostrarOrdenAnterior();
  }

  private limpiarOrdenAnteriorCotizacionSinDetalles(): void {
    if (this.cotizacion) {
      this.cotizacion = {
        ...this.cotizacion,
        ordenAnterior: 0,
        appDetailQuotesGetDto: [],
      };
    }

    if (this.appGeneralQuotesGetDto) {
      this.appGeneralQuotesGetDto = {
        ...this.appGeneralQuotesGetDto,
        ordenAnterior: 0,
        appDetailQuotesGetDto: [],
      };
    }
  }

  cargarDetalleEnFormulario(item: AppDetailQuotesGetDto): void {
    this.operacion = 1;
    this.item = item;
    this.detalleSeleccionadoId = item.id;
    this.appProduct = item.appProductsGetDto;
    this.calculoId = item.calculoId;
    this.configuraCreateOrEdit();
    this.setColorToolbar();
    this.setMostrarOrdenAnterior();
  }

  onChangeCondicionPago(event) {
    this.condicionPagoCodigo = event.target.value;
    this.condicionPagoDto = this.listCondicionPagoDto.find(
      (x) => x.codigo === this.condicionPagoCodigo,
    );

    this.form.get('condicionPago').setValue(event.target.value);
    this.subjectKeyUp.next('onChangeCondicionPago');
  }
  setMostrarOrdenAnterior() {
    this.mostarOrdenAnterior = false;
    if (this.operacion === 0) {
      this.mostarOrdenAnterior = true;
      return;
    }
    if (this.operacion === 1 && this.cotizacion.ordenAnterior > 0) {
      this.mostarOrdenAnterior = true;

      return;
    }
  }

  onChangeSubCategoriaId(event) {
    if (this.operacion === 1) {
      this.form
        .get('subCategoriaId')
        .setValue(this.item?.appProductsGetDto?.appSubCategoryId || '');
      this.generalService.presentToast(
        'Para cambiar el producto, elimine este ítem y agregue uno nuevo.',
        'warning',
      );
      return;
    }

    //Establezco ID de sub-categoria
    this.subCategoryid = event.detail.value;
    this.form.get('subCategoriaId').setValue(this.subCategoryid);

    this.form.get('producto').setValue('');
    this.form.get('descripcionProducto').setValue('');
    this.form.get('nombreComercialProducto').setValue('');

    this.appProduct = null;
    this.item.appProductsGetDto = null;
    this.uiIdProducto = 0;

    this.form.get('unidad').setValue('');
    this.appProductConversionGetDto = null;
    this.descripcionSalesUnit = '';
    this.uiIdUnidad = 0;
  }

  configuraCreateOrEdit() {
    //datos recibidos
    //this.operacion = this.router.getCurrentNavigation().extras.state.operacion;

    this.uiId = 0;
    this.uiIdProducto = 0;
    this.uiIdUnidad = 0;
    this.uiUsuarioConectado = '';
    this.uiUnitPriceConverted = 0;
    this.unitPriceBaseProduction = 0;
    this.uiTasa = this.tasa || this.uiTasa || 0;
    this.flete = 0;
    this.newPrecioMasFlete = 0;

    /*if (this.cotizacion.idMtrTipoMoneda === 1) {
      this.isBs = true;
    }

    if (this.cotizacion.idMtrTipoMoneda === 2) {
      this.isDolar = true;
    }*/
    this.isDolar = true;
    this.isBs = false;

    if (this.operacion === 0) {
      //Modo Crear, se habilita al graba

      this.item.cantidad = 0;
      this.item.diasEntrega = 0;
      this.item.precio = 0;
      this.item.precioUsd = 0;
      this.item.total = 0;
      this.item.totalUsd = 0;
      this.item.statusAprobacionDto =
        this.detalleBusinessRules.crearEstadoAprobadoInicial();

      this.calculadoraEnabled = false;

      this.btnCalculadoraDisabled = true;

      this.btnUmDisabled = true;

      this.uiImageLink = this.generalService.noImageUrl();

      //nombre producto in card
      this.uiNombreProductoInCard = '?';

      this.cotizacionesListService.precioLista = 0;
      this.cotizacionesListService.precioListaProduccion = 0;
    }

    //boton calculadora
    if (this.operacion === 1) {
      //Modo Editar

      //this.item = this.router.getCurrentNavigation().extras.state.item;

      this.cotizacionesListService.precioLista = this.item.unitPriceConverted;
      this.cotizacionesListService.precioListaProduccion =
        this.item.unitPriceBaseProduction;

      //this.cantidadPorUnidadProduccion = Math.trunc(1 / this.item.valorConvertido);
      this.cantidadPorUnidadProduccion =
        this.item.cantidadSolicitada / this.item.cantidad;
      this.calculadoraEnabled = true;

      this.btnCalculadoraDisabled = false;

      this.btnUmDisabled = false;

      this.uiImageLink =
        this.item.appProductsGetDto.link || this.generalService.noImageUrl();


      //nombre producto in card
      this.uiNombreProductoInCard =
        this.item.appProductsGetDto.description1 +
        ' ' +
        this.item.appProductsGetDto.description2;

      this.uiId = this.item.id;
      this.uiIdProducto = this.item.idProducto;
      this.uiIdUnidad = this.item.idUnidad;
      this.uiUsuarioConectado = this.generalService.GetUsuario().user;
      this.uiUnitPriceConverted = this.item.unitPriceConverted;
      this.unitPriceBaseProduction = this.item.unitPriceBaseProduction;
      this.appProductConversionGetDto = this.item.appProductConversionGetDto;

      if (this.cotizacion.porcFlete > 0) {
        this.flete =
          (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;
      }

      this.decripcionProductionUnit =
        this.item.appProductsGetDto.productionUnitGetDto.description1;
      this.descripcionSalesUnit = this.item.appUnitsGetDto.description1;
      this.subCategoryid = this.item.appProductsGetDto.appSubCategoryId;
    }

    //Para presentacion inicial UI (se formatea al presentar en showdata)

    //------------------------------------

    this.variables.cantidad = this.item.cantidad;

    this.variables.precioUsd = this.item.precioUsd;

    this.variables.precio = this.item.precio;

    this.variables.total = this.item.total;

    this.variables.totalUsd = this.item.totalUsd;

    if (this.operacion === 0) {
      //create

      this.tituloUi = 'Añadir Detalle a Cotización';

      this.variables.cantidadStr = '0';

      this.variables.precioStr = '0';

      this.variables.precioUsdStr = '0';

      this.variables.totalStr = '0';

      this.variables.totalUsdStr = '0';

      //id producto
      this.dtoCalculadora.appProductId = 0;

      //id de la um seleccionada
      this.dtoCalculadora.appUnitIdSince = 0;

      //es el id um del producto
      this.dtoCalculadora.appUnitIdUntil = 0;

      //arreglo de variables
      this.dtoCalculadora.appTemplateConversionGenericUnitGetDto = [];
    }

    if (this.operacion === 1) {
      //edit

      this.tituloUi = ' Detalle de Cotización';
      if (this.item.idEstatus >= 5) {
        // eslint-disable-next-line max-len
        this.tituloUi =
          'Detalle de Cotización GANADA!!! no puede ser modificado, no se realizara recalculo de precio ni actualizacion de datos';
      }

      this.variables.cantidadStr = this.item.cantidad.toString();

      this.variables.precioStr = this.item.precio.toString();

      this.variables.precioUsdStr = this.item.precioUsd.toString();

      this.variables.totalStr = this.item.total.toLocaleString();

      this.variables.totalUsdStr = this.item.totalUsd.toLocaleString();

      //this.form.get('nombreProductoInCard').setValue("");

      //---
      //id producto
      this.dtoCalculadora.appProductId = this.item.idProducto;

      //id de la um seleccionada
      this.dtoCalculadora.appUnitIdSince = this.item.idUnidad;

      //es el id um del producto
      this.dtoCalculadora.appUnitIdUntil =
        this.item.appProductsGetDto.productionUnitId;

      //arreglo de variables
      this.dtoCalculadora.appTemplateConversionGenericUnitGetDto =
        this.item.appTemplateConversionUnitGetDto;
    }

    //------------------------------------

    this.showData();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      producto: ['', [Validators.required]],
      nombreComercialProducto: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(200),
        ],
      ],
      unidad: ['', [Validators.required, Validators.minLength(2)]],
      cantidad: [0, [Validators.required, Validators.min(0.00000000001)]],
      //precio: [0, [Validators.required, Validators.min(0.00000000001)]],
      precio: [0, []],
      total: ['', [Validators.required]],
      precioUsd: [0, [Validators.required, Validators.min(0.00000000001)]],
      totalUsd: ['', [Validators.required]],
      diasEntrega: [0, [Validators.required, Validators.min(1)]],
      observaciones: ['', [Validators.maxLength(200)]],
      obsSolicitud: ['', []],
      obsSolicitudSobreprecio: ['', []],
      cantidadSolicitada: [0, Validators.required],
      condicionPago: [40, [Validators.required]],
      subCategoriaId: ['', []],
      descripcionProducto: ['', []],
      medidaBasica: ['', []],
      medidaOpuesta: ['', []],
      ordenAnterior: ['', []],
      cantidadConvertidaAlternativa: [0],
      forma: ['', []],
      salida: ['', []],
      presentacion: ['', [Validators.maxLength(200)]],
      mensajeSolicitarPrecio: ['', []],
      estimada: [false, []],
    });
  }

  showData() {
    const precioDto = this.buildPrecioDto({
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      precioMasFlete: 0,
      calculoId: this.item.calculoId,
      flete: this.flete,
      porcFlete: this.cotizacion.porcFlete,
      precioMaximo: 0,
      precioMaximoMasFlete: 0,
      porcMaximoSobrePrecio: this.item?.porcMaximoSobrePrecio ?? 0,
      porDebajoDeCantidadMinima: this.porDebajoDeCantidadMinima,
    });
    this.guardarPrecioMasFlete(precioDto);

    if (this.operacion === 1) {
      this.form.get('estimada').setValue(this.item.estimada);

      if (this.item.mensajeSolicitarPrecio) {
        this.form
          .get('mensajeSolicitarPrecio')
          .setValue(this.item.mensajeSolicitarPrecio);
      }

      this.condicionPagoCodigo = this.cotizacion.idCondPago;
      this.condicionPagoDto = this.cotizacion.condicionPagoDto;
      this.form.get('condicionPago').setValue(this.cotizacion.idCondPago);
      //editar
      this.uiImageLink =
        this.item.appProductsGetDto.link || this.generalService.noImageUrl();
      this.form.get('unidad').setValue(this.item.appUnitsGetDto.description1); //this.item.AppUnitsGetDto.code);
      this.form.get('ordenAnterior').setValue(this.cotizacion.ordenAnterior);
      this.uiIdUnidad = this.item.idUnidad;

      this.appProduct = this.item.appProductsGetDto;
      this.form.get('producto').setValue(this.item.appProductsGetDto.code);
      this.form
        .get('descripcionProducto')
        .setValue(this.item.appProductsGetDto.description1);
      this.form
        .get('subCategoriaId')
        .setValue(this.item.appProductsGetDto.appSubCategoryId);
      this.requiereDatosEntrada =
        this.item.appProductsGetDto.requiereDatosEntrada;
      this.form
        .get('nombreComercialProducto')
        .setValue(this.item.nombreComercialProducto);
      this.cotizacionesListService.precioLista = this.item.unitPriceConverted;

      this.form.get('cantidad').setValue(this.item.cantidad);
      this.form
        .get('cantidadSolicitada')
        .setValue(this.item.cantidadSolicitada);
      this.form.get('precio').setValue(this.item.precio);
      this.form.get('precioUsd').setValue(this.item.precioUsd);
      this.ultimoPrecioUsd = this.item.precioUsd;

      this.form.get('medidaBasica').setValue(this.item.medidaBasica);
      this.form.get('medidaOpuesta').setValue(this.item.medidaOpuesta);
      this.form.get('total').setValue(this.item.cantidad * this.item.precio);
      this.form
        .get('totalUsd')
        .setValue(this.item.cantidad * this.item.precioUsd);

      this.form.get('diasEntrega').setValue(this.item.diasEntrega);
      this.form.get('observaciones').setValue(this.item.observaciones);
      this.form.get('obsSolicitud').setValue(this.item.obsSolicitud);
      this.form
        .get('obsSolicitudSobreprecio')
        .setValue(
          this.item.appSolicitudAprobacionDto?.observacionSolicitante ||
            this.item.obsSolicitudSobreprecio ||
            '',
        );
      this.variables.permitirLectura = true;
      this.unitPriceBaseProduction = this.item.unitPriceBaseProduction;
      this.flete = this.item.flete;
      this.calculoId = this.item.calculoId;
      this.item.forma = this.item.forma ?? '';
      this.item.salida = this.item.salida ?? '';
      this.item.presentacion = this.item.presentacion ?? '';
      this.form.get('forma').setValue(this.item.forma);
      this.form.get('salida').setValue(this.item.salida);
      this.form.get('presentacion').setValue(this.item.presentacion);
    } else {
      this.condicionPagoCodigo = this.cotizacion.idCondPago;
      this.condicionPagoDto = this.cotizacion.condicionPagoDto;
      this.form.get('condicionPago').setValue(this.cotizacion.idCondPago);
      //nuevo
      this.uiImageLink = '';
      this.form.get('unidad').setValue('');
      this.form.get('ordenAnterior').setValue(this.cotizacion.ordenAnterior);
      this.precio = 1;
      this.form.get('precio').setValue(this.precio);
      this.calculoId = 0;
      if (
        this.cotizacion.ordenAnterior > 0 &&
        this.cotizacion.appOrdenProductoRepeticionGetDto
      ) {
        const ordenAnterior = this.cotizacion.appOrdenProductoRepeticionGetDto;
        const productoOrdenAnterior =
          ordenAnterior.appProductsGetDto || (ordenAnterior as any).appProductGetDto;
        const conversionOrdenAnterior = ordenAnterior.appProductConversionGetDto;

        if (!productoOrdenAnterior?.id) {
          this.generalService.presentToast(
            'La orden anterior seleccionada no tiene producto asociado',
            'warning',
          );
          return;
        }

        this.form
          .get('subCategoriaId')
          .setValue(productoOrdenAnterior.appSubCategoryId || '');
        this.form
          .get('producto')
          .setValue(productoOrdenAnterior.code || ordenAnterior.codProducto);
        this.form
          .get('descripcionProducto')
          .setValue(productoOrdenAnterior.description1 || ordenAnterior.nombreProducto);
        this.form
          .get('nombreComercialProducto')
          .setValue(ordenAnterior.nombreForma);
        this.form.get('forma').setValue(ordenAnterior.forma);
        this.form
          .get('salida')
          .setValue(ordenAnterior.salida);
        this.form
          .get('presentacion')
          .setValue(ordenAnterior.presentacion);

        //Propiedades
        this.appProduct = productoOrdenAnterior;
        this.item.appProductsGetDto = this.appProduct;
        this.uiIdProducto = this.appProduct.id;
        this.uiImageLink =
          this.appProduct.link || this.generalService.noImageUrl();
        this.uiNombreProductoInCard =
          (this.appProduct.description1 || '') +
          ' ' +
          (this.item.appProductsGetDto.description2 || '');
        this.btnUmDisabled = false;
        this.decripcionProductionUnit =
          this.appProduct.productionUnitGetDto?.description1 || '';
        this.requiereDatosEntrada = this.appProduct.requiereDatosEntrada;

        this.appProductConversionGetDto = conversionOrdenAnterior;
        this.form
          .get('unidad')
          .setValue(
            this.appProductConversionGetDto?.appUnitsAlternativaDescription || '',
          );
        this.uiIdUnidad =
          this.appProductConversionGetDto?.appUnitsIdAlternativa || 0;

        if (this.appProduct && !this.requiereDatosEntrada) {
          this.form.get('medidaBasica').setValue(0);
          this.form.get('medidaOpuesta').setValue(0);
        } else {
          this.form
            .get('medidaBasica')
            .setValue(ordenAnterior.medidaBasicaCm);
          this.form
            .get('medidaOpuesta')
            .setValue(ordenAnterior.medidaOpuestaCm);
        }

        if (ordenAnterior.codProducto === '4402') {
          this.form
            .get('medidaBasica')
            .setValue(ordenAnterior.medidaBasicaCm);
          this.form
            .get('medidaOpuesta')
            .setValue(ordenAnterior.medidaOpuestaCm);
        }
        this.form
          .get('cantidadSolicitada')
          .setValue(ordenAnterior.cantidadOrdenada);

        this.descripcionSalesUnit =
          this.appProductConversionGetDto?.appUnitsAlternativaDescription || '';
      }
    }

    //actualizo el servicio con el precio lista del item recibido

    if (this.cotizacion.porcFlete > 0) {
      this.flete =
        (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;
    }
    if (!this.item?.appStatusQuoteGetDto?.flagModificar) {
      this.unitPriceBaseProduction = this.item?.unitPriceBaseProduction ?? 0; // Valor por defecto (0 o el que necesites)
      this.flete = this.item?.flete ?? 0; // Valor por defecto (0 o el que necesites)
    }

    this.calculaTotalVenta(this.form.get('precioUsd').value);
  }

  private getObsSolicitudParaGuardar(): string {
    return this.detalleBusinessRules.prepararObservacionSolicitudPrecio(
      this.form.get('obsSolicitud').value,
      this.appProduct.requiereEstimacion === true,
    );
  }

  private resetMedidasSiNoRequiereDatosEntrada(): void {
    if (this.appProduct && !this.requiereDatosEntrada) {
      this.form.get('medidaBasica').setValue(0);
      this.form.get('medidaOpuesta').setValue(0);
    }
  }

  private asignarCamposComunesDetalle(
    dto: AppDetailQuotesCreateDto | AppDetailQuotesUpdateDto,
  ): void {
    dto.condicionPago = this.condicionPagoCodigo;
    dto.nombreComercialProducto = this.form.get(
      'nombreComercialProducto',
    ).value;
    dto.diasEntrega = this.form.get('diasEntrega').value;
    dto.observaciones = this.form.get('observaciones').value;
    dto.cantidad = this.form.get('cantidad').value;
    dto.cantidadSolicitada = this.form.get('cantidadSolicitada').value;
    dto.precio = this.form.get('precio').value;
    dto.total = this.form.get('total').value;
    dto.precioUsd = this.form.get('precioUsd').value;
    dto.totalUsd = this.form.get('totalUsd').value;
    dto.precioLista = this.unitPriceBaseProduction;
    dto.solicitarPrecio = this.solicitarPrecio;
    dto.obsSolicitud = this.getObsSolicitudParaGuardar();
    dto.obsSolicitudSobreprecio = this.form.get(
      'obsSolicitudSobreprecio',
    ).value;

    this.resetMedidasSiNoRequiereDatosEntrada();

    dto.medidaBasica = this.form.get('medidaBasica').value;
    dto.medidaOpuesta = this.form.get('medidaOpuesta').value;
    dto.valorConvertido = this.form.get('cantidad').value;
    dto.cantidadPorUnidadProduccion = this.cantidadPorUnidadProduccion;
    dto.ordenAnterior = this.form.get('ordenAnterior').value;
    dto.calculoId = this.calculoId;
    dto.unitPriceBaseProductionMaximo = this.precioMaximo;
    dto.porcMaximoSobrePrecio = this.getPorcMaximoSobrePrecio();
    dto.forma = this.form.get('forma').value;
    dto.salida = this.form.get('salida').value;
    dto.presentacion = this.form.get('presentacion').value;
  }

  private buildCreateDetalleDto(): AppDetailQuotesCreateDto {
    const dto = new AppDetailQuotesCreateDto();

    dto.appGeneralQuotesId = this.cotizacion.id;
    dto.cotizacion = this.cotizacion.cotizacion;
    dto.idProducto = this.uiIdProducto;
    dto.idUnidad = this.uiIdUnidad;
    dto.idEstatus = 1;
    dto.producto = this.form.get('producto').value;
    this.asignarCamposComunesDetalle(dto);
    dto.usuarioConectado = this.generalService.GetUsuario().user;

    return dto;
  }

  private buildUpdateDetalleDto(
    eliminarSolicitud: boolean,
  ): AppDetailQuotesUpdateDto {
    const dto = new AppDetailQuotesUpdateDto();

    dto.eliminarSolicitud = eliminarSolicitud;
    dto.appGeneralQuotesId = this.cotizacion.id;
    dto.cotizacion = this.cotizacion.cotizacion;
    dto.id = this.item.id;
    dto.idEstatus = this.cotizacion.idEstatus;
    dto.producto = this.item.producto;
    dto.idProducto = this.item.idProducto;
    dto.idUnidad = this.uiIdUnidad;
    this.asignarCamposComunesDetalle(dto);
    dto.usuarioConectado = this.generalService.GetUsuario().user;

    return dto;
  }

  private validarProductoNoModificado(): boolean {
    const validationMessage =
      this.detalleBusinessRules.validarIdentidadProductoDetalle({
        operacion: this.operacion,
        idProductoOriginal: this.item?.idProducto,
        idProductoActual: this.uiIdProducto,
      });

    if (!validationMessage) {
      return true;
    }

    this.restaurarIdentidadProductoOriginal();
    this.generalService.presentToast(validationMessage, 'danger');
    return false;
  }

  private restaurarIdentidadProductoOriginal(): void {
    if (!this.item?.idProducto) {
      return;
    }

    this.appProduct = this.item.appProductsGetDto;
    this.uiIdProducto = this.item.idProducto;
    this.form.get('producto').setValue(this.item.appProductsGetDto?.code || '');
    this.form
      .get('descripcionProducto')
      .setValue(this.item.appProductsGetDto?.description1 || '');
    this.form
      .get('subCategoriaId')
      .setValue(this.item.appProductsGetDto?.appSubCategoryId || '');
    this.subCategoryid = this.item.appProductsGetDto?.appSubCategoryId;
  }

  private aplicarCotizacionGuardada(
    cotizacionGuardada: AppGeneralQuotesGetDto,
    actualizarCotizacionActual: boolean,
    asignarPrimerDetalle: boolean,
  ): void {
    this.appGeneralQuotesGetDto = cotizacionGuardada;

    if (actualizarCotizacionActual) {
      this.cotizacion = cotizacionGuardada;
    }

    this.detalleItems = (
      this.appGeneralQuotesGetDto.appDetailQuotesGetDto || []
    ).map((detalle) => this.mapDetalleItem(detalle));

    if (asignarPrimerDetalle) {
      this.item =
        this.detalleItems.find((detalle) => detalle.id === this.item?.id) ||
        this.detalleItems[0];
    }

    this.cotizacionesListService.cotizacion$.next(
      actualizarCotizacionActual ? this.cotizacion : this.appGeneralQuotesGetDto,
    );
  }

  private normalizarCotizacionDespuesDeEliminar(
    data: any,
    detalleEliminadoId: number,
  ): AppGeneralQuotesGetDto {
    const cotizacionRespuesta = Array.isArray(data) ? data[0] : data;
    const cotizacionBase =
      cotizacionRespuesta && cotizacionRespuesta.appDetailQuotesGetDto
        ? cotizacionRespuesta
        : this.cotizacion;

    return {
      ...cotizacionBase,
      appDetailQuotesGetDto: (
        cotizacionBase?.appDetailQuotesGetDto || []
      ).filter((detalle) => !this.esMismoDetalle(detalle.id, detalleEliminadoId)),
    };
  }

  private esMismoDetalle(idA: any, idB: any): boolean {
    return String(idA ?? '') === String(idB ?? '');
  }

  private removerDetalleLocal(detalleEliminadoId: any): void {
    const detallesActuales = this.detalleItems || [];
    const detallesFiltrados = detallesActuales.filter(
      (detalle) => !this.esMismoDetalle(detalle.id, detalleEliminadoId),
    );
    const sinDetalles = detallesFiltrados.length === 0;

    this.detalleItems = detallesFiltrados;

    if (this.cotizacion) {
      this.cotizacion = {
        ...this.cotizacion,
        ordenAnterior: sinDetalles ? 0 : this.cotizacion.ordenAnterior,
        appDetailQuotesGetDto: detallesFiltrados,
      };
    }

    if (this.appGeneralQuotesGetDto) {
      this.appGeneralQuotesGetDto = {
        ...this.appGeneralQuotesGetDto,
        ordenAnterior: sinDetalles
          ? 0
          : this.appGeneralQuotesGetDto.ordenAnterior,
        appDetailQuotesGetDto: detallesFiltrados,
      };
    }
  }

  private seleccionarDetalleDespuesDeEliminar(): void {
    const primerDetalle = this.detalleItems[0];

    if (primerDetalle) {
      this.cargarDetalleEnFormulario(primerDetalle);
      return;
    }

    this.nuevoProducto(true);
  }

  private refrescarDetallesDespuesDeEliminar(
    detalleEliminadoId: any,
    mensajeExito: string,
  ): void {
    const filter = {
      appGeneralQuotesId: this.cotizacion.id,
      appGeneralQuoteId: this.cotizacion.id,
      idAppGeneralQuotes: this.cotizacion.id,
      id: this.cotizacion.id,
      cotizacion: this.cotizacion.cotizacion,
    };

    this.cotizacionesListService
      .GetListaDetalleCotizacionPorGeneralId(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          const data = resp?.data;
          const detallesRespuesta = Array.isArray(data)
            ? data[0]?.appDetailQuotesGetDto || data
            : data?.appDetailQuotesGetDto || [];
          const detalles = detallesRespuesta.filter(
            (detalle) => !this.esMismoDetalle(detalle.id, detalleEliminadoId),
          );
          const cotizacionActualizada = {
            ...this.cotizacion,
            ordenAnterior:
              detalles.length === 0 ? 0 : this.cotizacion.ordenAnterior,
            appDetailQuotesGetDto: detalles,
          };

          this.aplicarCotizacionGuardada(cotizacionActualizada, true, false);
          this.seleccionarDetalleDespuesDeEliminar();

          this.generalService.presentToast(mensajeExito, 'success');
        },
        error: () => {
          this.seleccionarDetalleDespuesDeEliminar();

          this.generalService.presentToast(mensajeExito, 'success');
        },
      });
  }

  private mostrarResultadoGuardado(message: string): void {
    const mensajeSolicitarPrecio =
      this.appGeneralQuotesGetDto?.mensajeSolicitarPrecio || '';

    if (mensajeSolicitarPrecio.length > 0) {
      this.generalService.presentToastLong(
        'COTIZACIÓN ENVIADA PARA APROBACIÓN POR: ' + mensajeSolicitarPrecio,
        'danger',
      );
      return;
    }

    this.generalService.presentToast(message, 'success');
  }

  //Insert - ok
  onInsert(eliminarSolicitud: boolean) {
    if (!this.validarAdicionarDetalle()) {
      return;
    }

    this.setPrecioMasFlete();
    const detailCreateDto = this.buildCreateDetalleDto();
    this.showLoading = true;

    this.mensaje = 'Guardando Cotizacion';
    this.cotizacionesListService
      .InsertDetalleCotizacion(detailCreateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.meta.isValid) {
          this.aplicarCotizacionGuardada(result.data[0], true, true);
          this.detalleSeleccionadoId = this.item?.id || 0;
          this.operacion = 1;
          this.configuraCreateOrEdit();
        }

        if (result.meta.isValid) {
          this.showLoading = false;
          this.mostrarResultadoGuardado(result.meta.message);
        } else {
          this.showLoading = false;
          this.generalService.presentToast(result.meta.message, 'danger');
        }
        this.mensaje = '';
      });
  }

  onUpdate(eliminarSolicitud: boolean) {
    let detailUpdateDto: AppDetailQuotesUpdateDto;

    try {
      this.setPrecioMasFlete();
      detailUpdateDto = this.buildUpdateDetalleDto(eliminarSolicitud);

      this.showLoading = true;
      this.mensaje = 'Guardando Cotizacion';
    } catch {
      this.showLoading = false;
      this.mensaje = 'Error interno al procesar los datos.';
      this.generalService.presentToast(
        'Error interno: Falló la preparación de datos.',
        'danger',
      );
      return;
    }

    this.cotizacionesListService
      .UpdateDetalleCotizacion(detailUpdateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.meta.isValid) {
            this.aplicarCotizacionGuardada(result.data[0], false, false);
            const itemActualizado = this.detalleItems.find(
              (detalle) => detalle.id === this.item.id,
            );
            if (itemActualizado) {
              this.cargarDetalleEnFormulario(itemActualizado);
            }
            this.showLoading = false;
            this.mensaje = '';
            this.mostrarResultadoGuardado(result.meta.message);
          } else {
            this.showLoading = false;
            this.generalService.presentToast(result.meta.message, 'danger');
          }
        },
        error: (err) => {
          this.showLoading = false;
          this.mensaje = '';
          let errorMessage =
            'Error al actualizar el detalle de la cotización. Intente de nuevo.';
          if (err && err.message) {
            errorMessage = `Error de conexión/servidor: ${err.message}`;
          }
          this.generalService.presentToast(errorMessage, 'danger');
        },
      });
  }

  onSave(eliminarSolicitud: boolean): void {
    if (!this.validarProductoNoModificado()) {
      return;
    }

    const validationMessage = this.detalleBusinessRules.validarGuardado({
      diasEntrega: this.form.get('diasEntrega').value,
      tipoCalculo: this.appProduct?.tipoCalculo,
      medidaBasica: this.form.get('medidaBasica').value,
      medidaOpuesta: this.form.get('medidaOpuesta').value,
      requiereAprobacionPrecio: this.requiereAprobacionPrecio,
      observacionSolicitud: this.form.get('obsSolicitud').value,
      appSubCategoryId: this.appProduct?.appSubCategoryId,
      salida: this.form.get('salida').value,
      forma: this.form.get('forma').value,
      presentacion: this.form.get('presentacion').value,
      precioAprobadoUsd: this.item.statusAprobacionDto.valorVentaAprobarUsd,
      precioVentaUsd: this.form.get('precioUsd').value,
    });

    if (validationMessage) {
      this.generalService.presentToast(validationMessage, 'danger');
      return;
    }

    if (this.requiereAprobacionPrecio === true) {
      this.solicitarPrecio = true;
    }

    //habilita boton calculadora
    this.calculadoraEnabled = true;

    //INSERT
    if (this.operacion === 0) {
      this.onInsert(eliminarSolicitud);
    }

    //UPDATE
    if (this.operacion === 1) {
      this.onUpdate(eliminarSolicitud);
    }
  }

  enviarAprobacion() {
    if (
      this.requiereAprobacionPrecio === true &&
      this.form.get('obsSolicitud').value === ''
    ) {
      this.generalService.presentToast(
        'Indique observación de solicitud de precios y presione enviar solicitud',
        'danger',
      );
      return;
    } else {
      this.solicitarPrecio = true;
      this.onSave(true);
    }
  }

  puedeEnviarSolicitudPrecio(): boolean {
    const precioVenta = this.toNumber(this.form?.get('precioUsd')?.value);
    const observacion = (this.form?.get('obsSolicitud')?.value || '').trim();

    return (
      !this.showLoading &&
      this.form?.valid === true &&
      this.requiereAprobacionPrecio === true &&
      precioVenta > 0 &&
      observacion.length > 0
    );
  }

  puedeEnviarAprobacionPorSobreprecio(): boolean {
    return this.detalleBusinessRules.puedeEnviarAprobacionPorSobreprecio(
      this.getPrecioBaseSobreprecio(),
      this.getPrecioVentaActual(),
      this.getPorcMaximoSobrePrecio(),
    );
  }

  getSolicitudAprobacionSobreprecio(
    item: AppDetailQuotesGetDto = this.item,
  ): AppSolicitudAprobacion {
    return item?.appSolicitudAprobacionDto || null;
  }

  tieneSolicitudSobreprecio(item: AppDetailQuotesGetDto = this.item): boolean {
    return !!this.getSolicitudAprobacionSobreprecio(item);
  }

  solicitudSobreprecioPendiente(
    item: AppDetailQuotesGetDto = this.item,
  ): boolean {
    const solicitud = this.getSolicitudAprobacionSobreprecio(item);
    return !!solicitud && !solicitud.aprobado && !solicitud.rechazado;
  }

  solicitudSobreprecioAprobada(
    item: AppDetailQuotesGetDto = this.item,
  ): boolean {
    return this.getSolicitudAprobacionSobreprecio(item)?.aprobado === true;
  }

  solicitudSobreprecioRechazada(
    item: AppDetailQuotesGetDto = this.item,
  ): boolean {
    return this.getSolicitudAprobacionSobreprecio(item)?.rechazado === true;
  }

  puedeSolicitarAprobacionPorSobreprecio(): boolean {
    if (!this.puedeEnviarAprobacionPorSobreprecio()) {
      return false;
    }

    return (
      !this.tieneSolicitudSobreprecio() || this.solicitudSobreprecioRechazada()
    );
  }

  puedeEnviarSolicitudSobreprecio(): boolean {
    const observacion = (
      this.form?.get('obsSolicitudSobreprecio')?.value || ''
    ).trim();

    return (
      !this.showLoading &&
      this.form?.valid === true &&
      this.puedeSolicitarAprobacionPorSobreprecio() &&
      observacion.length > 0
    );
  }

  getEstadoSolicitudSobreprecio(
    solicitud: AppSolicitudAprobacion = this.getSolicitudAprobacionSobreprecio(),
  ): string {
    if (!solicitud) {
      return '';
    }

    if (solicitud.aprobado) {
      return 'Sobreprecio aprobado';
    }

    if (solicitud.rechazado) {
      return 'Sobreprecio rechazado';
    }

    return 'Sobreprecio pendiente';
  }

  getColorSolicitudSobreprecio(
    solicitud: AppSolicitudAprobacion = this.getSolicitudAprobacionSobreprecio(),
  ): string {
    if (!solicitud) {
      return 'danger';
    }

    if (solicitud.aprobado) {
      return 'success';
    }

    if (solicitud.rechazado) {
      return 'danger';
    }

    return 'warning';
  }

  getClaseBannerSolicitudSobreprecio(): string {
    if (this.solicitudSobreprecioAprobada()) {
      return 'status-approved';
    }

    if (this.solicitudSobreprecioRechazada()) {
      return 'status-rejected';
    }

    return 'status-pending';
  }

  getIconoSolicitudSobreprecio(): string {
    if (this.solicitudSobreprecioAprobada()) {
      return 'checkmark-circle';
    }

    if (this.solicitudSobreprecioRechazada()) {
      return 'close-circle';
    }

    return 'alert-circle';
  }

  getPrecioVentaActual(): number {
    return Number(this.form?.get('precioUsd')?.value || this.variables.precioUsd || 0);
  }

  getPrecioBaseSobreprecio(): number {
    return Number(this.newPrecioMasFlete || 0);
  }

  getPorcentajeSobreprecio(): number {
    return this.detalleBusinessRules.calcularPorcentajeSobreprecio(
      this.getPrecioBaseSobreprecio(),
      this.getPrecioVentaActual(),
    );
  }

  getPorcMaximoSobrePrecio(): number {
    const precio = this.getPrecioMasFleteStorage();
    return this.toNumber(
      this.porcMaximoSobrePrecio ??
        precio?.porcMaximoSobrePrecio ??
        this.item?.porcMaximoSobrePrecio ??
        0,
    );
  }

  enviarAprobacionPorSobreprecio() {
    if (!this.puedeSolicitarAprobacionPorSobreprecio()) {
      if (this.solicitudSobreprecioPendiente()) {
        this.generalService.presentToast(
          'Ya existe una solicitud de sobreprecio pendiente',
          'warning',
        );
        return;
      }

      if (this.solicitudSobreprecioAprobada()) {
        this.generalService.presentToast(
          'El sobreprecio ya fue aprobado',
          'success',
        );
        return;
      }

      this.generalService.presentToast(
        `El sobreprecio no supera el ${this.generalService.maskFloat(
          this.getPorcMaximoSobrePrecio(),
        )}%`,
        'warning',
      );
      return;
    }

    if (!this.item?.id && this.operacion !== 0) {
      this.generalService.presentToast(
        'Guarde el producto antes de enviarlo a aprobación por sobreprecio',
        'warning',
      );
      return;
    }

    const observacionSolicitante = (
      this.form.get('obsSolicitudSobreprecio')?.value || ''
    ).trim();

    if (!observacionSolicitante) {
      this.generalService.presentToast(
        'Indique observación de solicitud de sobreprecio',
        'danger',
      );
      return;
    }

    const usuario = this.generalService.GetUsuario();
    const productoMaestro = this.appProduct || this.item?.appProductsGetDto;
    const codigoProducto = (
      productoMaestro?.externalCode ||
      productoMaestro?.['ExternalCode'] ||
      ''
    ).trim();

    if (!codigoProducto) {
      this.generalService.presentToast(
        'El producto no tiene código externo configurado',
        'danger',
      );
      return;
    }

    this.guardarFormularioAntesDeEnviarSobreprecio(() => {
      this.enviarSolicitudAprobacionPorSobreprecio(
        codigoProducto,
        usuario?.user ?? '',
        observacionSolicitante,
      );
    });
  }

  private enviarSolicitudAprobacionPorSobreprecio(
    codigoProducto: string,
    usuarioSolicitante: string,
    observacionSolicitante: string,
  ) {
    this.showLoading = true;
    this.mensaje = 'Enviando solicitud de aprobación por sobreprecio';
    this.solicitudAprobacionService
      .createFromDetailQuote({
        cotizacion: this.item?.cotizacion || this.cotizacion?.cotizacion,
        codigoProducto,
        usuarioSolicitante,
        observacionSolicitante,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showLoading = false;
          this.mensaje = '';
          const isValid =
            result?.isValid === true || result?.meta?.isValid === true;
          const message =
            result?.message ||
            result?.meta?.message ||
            'Solicitud enviada para aprobación por sobreprecio';

          this.generalService.presentToast(
            message,
            isValid ? 'success' : 'danger',
          );

          if (isValid && this.item) {
            this.item.obsSolicitudSobreprecio = observacionSolicitante;
            this.item.appSolicitudAprobacionDto =
              result?.data ||
              ({
                cotizacion: this.item?.cotizacion || this.cotizacion?.cotizacion,
                codigoProducto,
                observacionSolicitante,
                usuarioSolicitante,
                aprobado: false,
                rechazado: false,
              } as AppSolicitudAprobacion);
            this.item.statusAprobacionSobreprecioDto = {
              ...(this.item.statusAprobacionSobreprecioDto ||
                this.item.statusAprobacionDto),
              statusString: 'PENDIENTE',
              aprobado: false,
            };
            this.sincronizarDetalleActualEnLista();
          }
        },
        error: () => {
          this.showLoading = false;
          this.mensaje = '';
          this.generalService.presentToast(
            'Error al conectar con el servidor',
            'danger',
          );
        },
      });
  }

  private sincronizarDetalleActualEnLista(): void {
    if (!this.item?.id) {
      return;
    }

    this.detalleItems = this.detalleItems.map((detalle) =>
      detalle.id === this.item.id ? this.mapDetalleItem(this.item) : detalle,
    );
  }

  private guardarFormularioAntesDeEnviarSobreprecio(
    onGuardado: () => void,
  ): void {
    let detailDto: AppDetailQuotesCreateDto | AppDetailQuotesUpdateDto;

    try {
      this.setPrecioMasFlete();
      detailDto =
        this.operacion === 0
          ? this.buildCreateDetalleDto()
          : this.buildUpdateDetalleDto(false);
    } catch {
      this.generalService.presentToast(
        'Error interno al preparar el guardado',
        'danger',
      );
      return;
    }

    this.showLoading = true;
    this.mensaje = 'Guardando cotización antes de enviar sobreprecio';

    const request$ =
      this.operacion === 0
        ? this.cotizacionesListService.InsertDetalleCotizacion(
            detailDto as AppDetailQuotesCreateDto,
          )
        : this.cotizacionesListService.UpdateDetalleCotizacion(
            detailDto as AppDetailQuotesUpdateDto,
          );

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const isValid = result?.meta?.isValid === true;
          if (!isValid) {
            this.showLoading = false;
            this.mensaje = '';
            this.generalService.presentToast(
              result?.meta?.message || 'No se pudo guardar la cotización',
              'danger',
            );
            return;
          }

          const cotizacionGuardada = result.data[0];
          this.aplicarCotizacionGuardada(
            cotizacionGuardada,
            true,
            this.operacion === 0,
          );
          this.cotizacionesListService.cotizacion$.next(
            this.appGeneralQuotesGetDto,
          );

          const itemActualizado = this.operacion === 0
            ? this.item
            : this.appGeneralQuotesGetDto.appDetailQuotesGetDto?.find(
                (detalle) => detalle.id === this.item.id,
              );

          if (itemActualizado) {
            this.item = itemActualizado;
            this.appProduct = this.item.appProductsGetDto || this.appProduct;
          }

          if (this.operacion === 0) {
            this.detalleSeleccionadoId = this.item?.id || 0;
            this.operacion = 1;
            this.configuraCreateOrEdit();
          }

          this.showLoading = false;
          this.mensaje = '';
          onGuardado();
        },
        error: () => {
          this.showLoading = false;
          this.mensaje = '';
          this.generalService.presentToast(
            'Error al guardar la cotización antes de enviar sobreprecio',
            'danger',
          );
        },
      });
  }

  limpiarOrdenAnterior() {
    if (this.operacion === 0) {
      if (this.cotizacion.appDetailQuotesGetDto.length > 0) {
        this.cotizacion.appDetailQuotesGetDto[0].ordenAnterior = 0;
      }

      this.cotizacion.ordenAnterior = 0;
      this.form.get('ordenAnterior').setValue(0);
      this.form.get('subCategoriaId').setValue('');
      this.form.get('producto').setValue('');
      this.form.get('descripcionProducto').setValue('');
      this.form.get('nombreComercialProducto').setValue('');
      this.form.get('cantidadSolicitada').setValue(0);
      this.form.get('cantidad').setValue(0);
      this.form.get('forma').setValue('');
      this.form.get('salida').setValue('');
      this.form.get('presentacion').setValue('');
      this.appProduct = null;
      this.item.appProductsGetDto = null;
      this.uiIdProducto = 0;

      this.form.get('unidad').setValue('');
      this.appProductConversionGetDto = null;
      this.descripcionSalesUnit = '';
      this.uiIdUnidad = 0;
    }
  }

  goListDetalleCotizacion() {
    //{ state: { item: this.cotizacion } }
    this.router.navigate(['/menu/cotizacion-edit'], { state: { flag: true } });
  }

  async eliminarDetalleDesdeLista(item: AppDetailQuotesGetDto): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Eliminar producto',
      message: 'Desea eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmar',
          handler: () => {
            const deleteDto = new AppDetailQuotesDeleteDto();
            deleteDto.id = item.id;
            deleteDto.cotizacion = item.cotizacion;

            this.showLoading = true;
            this.mensaje = 'Eliminando producto';
            this.cotizacionesListService
              .DeleteDetalleCotizacion(deleteDto)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (result) => {
                  this.showLoading = false;
                  this.mensaje = '';
                  if (result.meta.isValid) {
                    this.removerDetalleLocal(item.id);
                    this.refrescarDetallesDespuesDeEliminar(
                      item.id,
                      result.meta.message,
                    );
                  } else {
                    this.generalService.presentToast(
                      result.meta.message,
                      'danger',
                    );
                  }
                },
                error: () => {
                  this.showLoading = false;
                  this.mensaje = '';
                  this.generalService.presentToast(
                    'Error al eliminar el producto',
                    'danger',
                  );
                },
              });
          },
        },
      ],
    });

    await alert.present();
  }

  encontrarValorMasCercano(
    item: any,
    objetivo: number,
    ...valores: number[]
  ): number {
    if (valores.length === 0) {
      throw new Error('Debe proporcionar al menos un valor para comparar');
    }

    // 1. Encontrar el más cercano de la lista 'valores'
    let valorMasCercano = valores.reduce((prev, curr) =>
      Math.abs(curr - objetivo) < Math.abs(prev - objetivo) ? curr : prev,
    );

    // 2. Lógica de conversión de unidad
    // Validamos que exista el DTO, que las unidades coincidan
    // Y MUY IMPORTANTE: que el precio convertido sea > 0
    if (
      item.appProductConversionGetDto &&
      item.appProductConversionGetDto.appUnitsIdAlternativa === item.idUnidad &&
      item.unitPriceConverted > 0 // <--- Validación crucial
    ) {
      valorMasCercano = item.unitPriceConverted;
    }

    // 3. Salvaguarda final: Si por alguna razón el resultado sigue siendo 0
    // devolvemos el primer valor de la lista original o el objetivo
    return valorMasCercano > 0 ? valorMasCercano : valores[0] || objetivo;
  }

  private toNumber(value: any): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  private getPrecioMasFleteStorage(): PrecioDto | null {
    return this.precioMasFleteStorage.get();
  }

  getPrecioMaximoMasFlete(): number {
    const totalMaximo =
      this.toNumber(this.precioMaximo) + this.toNumber(this.fleteMaximo);

    if (totalMaximo > 0) {
      return totalMaximo;
    }

    const precio = this.getPrecioMasFleteStorage();
    if (this.toNumber(precio?.precioMaximoMasFlete) > 0) {
      return this.toNumber(precio.precioMaximoMasFlete);
    }

    const itemMaximo =
      this.toNumber(this.item?.precioMaximo) +
      this.toNumber(this.item?.fleteMaximo);

    return itemMaximo > 0 ? itemMaximo : 0;
  }

  getPrecioMaximoMasFleteMasked(): string {
    const precioMaximoMasFlete =
      this.detalleBusinessRules.truncarLimiteComercial(
        this.getPrecioMaximoMasFlete(),
      );

    if (precioMaximoMasFlete <= 0) {
      return '0';
    }

    return this.generalService.maskFloat(precioMaximoMasFlete);
  }

  private resetPrecioMasFlete(): void {
    this.newPrecioMasFlete = 0;
    this.flete = 0;
    this.unitPriceBaseProduction = 0;
    this.calculoId = 0;
    this.precioMaximo = 0;
    this.fleteMaximo = 0;
    this.porcMaximoSobrePrecio = 0;
    this.porDebajoDeCantidadMinima = false;
  }

  private aplicarPrecioMasFlete(precio: PrecioDto): void {
    this.newPrecioMasFlete = this.detalleBusinessRules.truncarLimiteComercial(
      precio.precioMasFlete ?? 0,
    );
    this.flete = precio.flete ?? 0;
    this.unitPriceBaseProduction = precio.unitPriceBaseProduction ?? 0;
    this.calculoId = precio.calculoId ?? 0;
    this.precioMaximo = precio.precioMaximo ?? 0;
    this.porcMaximoSobrePrecio = precio.porcMaximoSobrePrecio ?? 0;
    this.fleteMaximo =
      precio.fleteMaximo ??
      this.detalleBusinessRules.calcularFleteMaximo({
        precioMaximo: this.precioMaximo,
        porcFlete: precio.porcFlete,
        precioMaximoMasFlete: precio.precioMaximoMasFlete,
      });
    this.porDebajoDeCantidadMinima =
      precio.porDebajoDeCantidadMinima ?? false;
  }

  private aplicarPrecioAprobadoEstimado(): void {
    const valorVentaAprobarUsd =
      this.item.statusAprobacionDto.valorVentaAprobarUsd;

    this.unitPriceBaseProduction = valorVentaAprobarUsd;
    this.newPrecioMasFlete =
      this.detalleBusinessRules.truncarLimiteComercial(
        valorVentaAprobarUsd,
      );
    this.precioMaximo = this.newPrecioMasFlete;
    this.fleteMaximo = 0;
  }

  private getPorcFleteAplicable(): number {
    if (this.appProduct?.porcFlete > 0) {
      return this.appProduct.porcFlete;
    }

    return this.cotizacion?.porcFlete || 0;
  }

  private buildPrecioDto(params: Partial<PrecioDto>): PrecioDto {
    return {
      unitPriceBaseProduction: params.unitPriceBaseProduction ?? 0,
      precioMasFlete: params.precioMasFlete ?? 0,
      calculoId: params.calculoId ?? 0,
      flete: params.flete ?? 0,
      fleteMaximo: params.fleteMaximo,
      porcFlete: params.porcFlete ?? 0,
      precioMaximo: params.precioMaximo ?? 0,
      precioMaximoMasFlete: params.precioMaximoMasFlete ?? 0,
      precioPorRango: params.precioPorRango,
      desde: params.desde,
      hasta: params.hasta,
      porcMaximoSobrePrecio:
        params.porcMaximoSobrePrecio ??
        this.porcMaximoSobrePrecio ??
        this.item?.porcMaximoSobrePrecio ??
        0,
      porDebajoDeCantidadMinima:
        params.porDebajoDeCantidadMinima ?? false,
    };
  }

  private buildPrecioDtoDesdeRespuestaPrecio(
    precioResponse: any,
    overrides: Partial<PrecioDto> = {},
  ): PrecioDto {
    return this.buildPrecioDto({
      unitPriceBaseProduction: precioResponse.precio,
      precioMasFlete: precioResponse.precioMasFlete,
      calculoId: precioResponse.calculoId,
      flete: precioResponse.flete,
      fleteMaximo: precioResponse.fleteMaximo,
      porcFlete: precioResponse.porcFlete ?? this.cotizacion?.porcFlete,
      precioMaximo: precioResponse.precioMaximo,
      precioMaximoMasFlete: precioResponse.precioMaximoMasFlete,
      precioPorRango: precioResponse.precioPorRango,
      desde: precioResponse.desde,
      hasta: precioResponse.hasta,
      porcMaximoSobrePrecio: precioResponse.porcMaximoSobrePrecio,
      porDebajoDeCantidadMinima: precioResponse.porDebajoDeCantidadMinima,
      ...overrides,
    });
  }

  private guardarPrecioMasFlete(precio: PrecioDto): void {
    this.precioMasFleteStorage.set(precio);
  }

  private resetPrecioParaEstimacion(precioBaseInicial = 0, calculoId = 0): void {
    this.unitPriceBaseProduction = precioBaseInicial;
    this.precioMaximo = 0;
    this.fleteMaximo = 0;
    this.newPrecioMasFlete = 0;
    this.calculoId = calculoId;
    this.uiUnitPriceConverted = 0;
  }

  private estaPorDebajoDeCantidadMinima(): boolean {
    const cantidadMinima = this.toNumber(this.appProduct?.cantidadMinima);
    const cantidad = this.toNumber(this.form?.get('cantidad')?.value);

    return cantidadMinima > 0 && cantidad > 0 && cantidad < cantidadMinima;
  }

  private tieneRespuestaCantidadMinima(precioResponse?: any): boolean {
    return (
      precioResponse &&
      Object.prototype.hasOwnProperty.call(
        precioResponse,
        'porDebajoDeCantidadMinima',
      )
    );
  }

  private actualizarEstadoCantidadMinima(precioResponse?: any): boolean {
    if (this.tieneRespuestaCantidadMinima(precioResponse)) {
      this.porDebajoDeCantidadMinima =
        precioResponse.porDebajoDeCantidadMinima === true;
      return this.porDebajoDeCantidadMinima;
    }

    this.porDebajoDeCantidadMinima = this.estaPorDebajoDeCantidadMinima();

    return this.porDebajoDeCantidadMinima;
  }

  private aplicarBloqueoPrecioPorCantidadMinima(calculoId = this.calculoId): void {
    const precioVentaUsd = this.toNumber(this.form?.get('precioUsd')?.value);
    const precioVenta = this.toNumber(this.form?.get('precio')?.value);

    this.resetPrecioParaEstimacion(0, calculoId);
    this.flete = 0;
    this.precioPorUnidad = 0;

    if (precioVentaUsd > 0) {
      this.form.get('precioUsd')?.setValue(precioVentaUsd);
      this.form.get('totalUsd')?.setValue(
        precioVentaUsd * this.toNumber(this.form?.get('cantidad')?.value),
      );
    }

    if (precioVenta > 0) {
      this.form.get('precio')?.setValue(precioVenta);
      this.form.get('total')?.setValue(
        precioVenta * this.toNumber(this.form?.get('cantidad')?.value),
      );
    }
  }

  private aplicarPrecioEstimacion(porcFlete: number): boolean {
    const precioEstimacion = this.toNumber(
      this.item?.statusAprobacionDto?.precioEstimacion,
    );

    if (precioEstimacion <= 0) {
      return false;
    }

    this.unitPriceBaseProduction = precioEstimacion;
    this.precioMaximo = precioEstimacion;
    this.fleteMaximo = this.detalleBusinessRules.calcularFleteMaximo({
      precioMaximo: this.precioMaximo,
      porcFlete,
    });

    return true;
  }

  private aplicarPrecioBaseDesdeRespuesta(precioResponse: any): void {
    const precio = precioResponse.precio;

    this.calculoId = precioResponse.calculoId;
    this.unitPriceBaseProduction = precio;
    this.item.unitPriceBaseProduction = precio;
    this.precioMaximo = precioResponse.precioMaximo;
    this.porcMaximoSobrePrecio = precioResponse.porcMaximoSobrePrecio ?? 0;
    this.item.porcMaximoSobrePrecio = this.porcMaximoSobrePrecio;
    this.fleteMaximo =
      precioResponse.fleteMaximo ??
      this.detalleBusinessRules.calcularFleteMaximo({
        precioMaximo: this.precioMaximo,
        porcFlete: precioResponse.porcFlete ?? this.cotizacion.porcFlete,
        precioMaximoMasFlete: precioResponse.precioMaximoMasFlete,
      });
  }

  private aplicarCantidadConvertidaDesdeRespuesta(
    precioResponse: any,
    options: {
      soloCantidadPositiva?: boolean;
      usarCantidadComoAlternativaSiNoExiste?: boolean;
      aplicarConversionMillar?: boolean;
    } = {},
  ): void {
    const cantidadConvertida = precioResponse.cantidadConvertida;
    const cantidadAlternativa = precioResponse.cantidadConvertidaAlternativa;

    if (!options.soloCantidadPositiva || cantidadConvertida > 0) {
      this.form.get('cantidad').setValue(cantidadConvertida);
    }

    if (cantidadAlternativa && cantidadAlternativa > 0) {
      this.form
        .get('cantidadConvertidaAlternativa')
        .setValue(cantidadAlternativa);
    } else if (options.usarCantidadComoAlternativaSiNoExiste) {
      this.form
        .get('cantidadConvertidaAlternativa')
        .setValue(cantidadConvertida);
    }

    if (
      options.aplicarConversionMillar &&
      this.appProduct.tipoCalculo === 4 &&
      this.uiIdUnidad === 615
    ) {
      this.cantidadPorUnidadProduccion = 1000;
      this.form
        .get('cantidad')
        .setValue(this.form.get('cantidadSolicitada').value / 1000);
    }

    this.item.cantidad = this.form.get('cantidad').value;
  }

  private buscarPrecioConEstado(
    filter: any,
    mensaje: string,
    mostrarLoading = false,
  ) {
    this.buscandoPrecio = true;
    this.showLoading = mostrarLoading ? true : this.showLoading;
    this.mensaje = mensaje;

    return this.productoService.getPrice(filter).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.buscandoPrecio = false;
        if (mostrarLoading) {
          this.showLoading = false;
        }
        this.mensaje = '';
      }),
    );
  }

  private actualizarMontosPorMoneda(): void {
    if (this.isBs === true) {
      //COTIZACION EN BS
      if (this.tasa > 0) {
        this.form
          .get('precioUsd')
          .setValue(this.form.get('precio').value / this.tasa);
      }
      this.form
        .get('total')
        .setValue(
          this.form.get('precio').value * this.form.get('cantidad').value,
        );
      this.form
        .get('totalUsd')
        .setValue(
          this.form.get('precioUsd').value * this.form.get('cantidad').value,
        );
    }

    this.isDolar = true;
    if (this.isDolar) {
      //COTIZACION EN DOLARES
      this.form
        .get('totalUsd')
        .setValue(
          this.form.get('precioUsd').value * this.form.get('cantidad').value,
        );

      if (this.tasa > 0) {
        if (this.ultimoPrecioUsd !== this.form.get('precioUsd').value) {
          this.ultimoPrecioUsd = this.form.get('precioUsd').value;
          this.form
            .get('precio')
            .setValue(this.form.get('precioUsd').value * this.tasa);
        }
      }

      this.form
        .get('total')
        .setValue(
          this.form.get('precio').value * this.form.get('cantidad').value,
        );
    }
  }

  setPrecioMasFlete() {
    if (!this.tieneProductoSeleccionado()) {
      this.resetPrecioMasFlete();
      return;
    }

    if (this.item.idEstatus >= 5) {
      ///const precio: PrecioDto = JSON.parse(precioString); s

      const a = this.item?.unitPriceBaseProduction ?? 0;
      let b = this.item?.unitPriceConverted ?? 0;
      if (b === 0) {
        b = this.item?.unitPriceBaseProduction ?? 0;
      }
      const objetivo = this.item?.precioUsd ?? 0;
      const resultado = this.encontrarValorMasCercano(
        this.item,
        objetivo,
        a,
        b,
      );

      this.calculoId = this.item?.calculoId ?? 0;
      this.unitPriceBaseProduction = resultado;
      this.flete = this.item?.flete ?? 0;

      this.newPrecioMasFlete = this.unitPriceBaseProduction ?? 0;

      this.newPrecioMasFlete = this.newPrecioMasFlete + this.flete;
      this.newPrecioMasFlete =
        this.detalleBusinessRules.truncarLimiteComercial(
          this.newPrecioMasFlete,
        );

      this.precioMaximo = this.item?.precioMaximo ?? 0;
      this.fleteMaximo = this.item?.fleteMaximo ?? 0;
      return;
    }

    const precio = this.getPrecioMasFleteStorage();
    if (!precio) {
      this.resetPrecioMasFlete();
      return;
    }

    this.aplicarPrecioMasFlete(precio);
    this.actualizarEstadoCantidadMinima(precio);
    if (this.item.statusAprobacionDto.aprobado && this.item.estimada) {
      this.aplicarPrecioAprobadoEstimado();
      return;
    }

    if (
      (this.item.appProductsGetDto &&
        this.item.appProductsGetDto.requiereEstimacion) ||
      this.porDebajoDeCantidadMinima
    ) {
      const calculoId = this.calculoId;
      const porDebajoDeCantidadMinima = this.porDebajoDeCantidadMinima;
      this.resetPrecioMasFlete();
      this.calculoId = calculoId;
      this.porDebajoDeCantidadMinima = porDebajoDeCantidadMinima;
    }
  }

  private resetEstadoAprobacionPrecio(): void {
    this.requiereAprobacionPrecio = false;
    this.colorToolbar = 'primary';
    this.solicitarPrecio = false;
    this.mensajeBotonSolicitarPrecio = '';
  }

  private aplicarEstadoAprobacionPrecio(
    aprobacion: ResultadoAprobacionPrecio,
  ): void {
    this.requiereAprobacionPrecio = aprobacion.requiereAprobacion;
    this.colorToolbar = aprobacion.colorToolbar;
    this.solicitarPrecio = aprobacion.solicitarPrecio;
    this.mensajeBotonSolicitarPrecio =
      aprobacion.mensajeBotonSolicitarPrecio;
  }

  private getParametrosAprobacionPrecioActual(): ParametrosAprobacionPrecio {
    return {
      precioBaseConFlete: this.newPrecioMasFlete,
      precioVentaUsd: this.variables.precioUsd,
      requiereEstimacion: this.appProduct.requiereEstimacion === true,
      porDebajoDeCantidadMinima: this.porDebajoDeCantidadMinima === true,
      idEstatus: this.item.idEstatus,
      aprobado: this.item.statusAprobacionDto.aprobado,
      flagCerrado: this.item.statusAprobacionDto.flagCerrado,
      operacion: this.operacion,
      isBs: this.isBs === true,
      codigoProducto: this.appProduct.code,
    };
  }

  private tieneProductoSeleccionado(): boolean {
    return (
      Number(this.appProduct?.id || 0) > 0 ||
      Number(this.uiIdProducto || 0) > 0 ||
      !!this.form?.get('producto')?.value
    );
  }

  setColorToolbar() {
    this.concesionString = '';
    this.variables.precioUsd = this.form.get('precioUsd').value;
    this.concesion = 0;
    this.setPrecioMasFlete();
    this.resetEstadoAprobacionPrecio();

    if (!this.tieneProductoSeleccionado()) {
      this.colorToolbar = 'primary';
      return;
    }

    const estadoPrecio = this.detalleBusinessRules.evaluarEstadoPrecio(
      this.getParametrosAprobacionPrecioActual(),
    );
    this.concesion = estadoPrecio.concesion.porcentaje;
    this.concesionString = estadoPrecio.concesion.texto;
    this.aplicarEstadoAprobacionPrecio(estadoPrecio.aprobacion);
  }

  //Buscador de productos OK
  async onBuscarProductoGeneral() {
    if (this.operacion === 1) {
      this.generalService.presentToast(
        'Para cambiar el producto, elimine este ítem y agregue uno nuevo.',
        'warning',
      );
      return;
    }

    const modal = await this.modalCtrl.create({
      component: BuscadorProductosComponent,
      componentProps: {
        userConectado: this.generalService.GetUsuario().user,
        subCategoria: this.subCategoryid,
      },
    });

    await modal.present();

    //---

    const { data } = await modal.onDidDismiss();

    if (data) {
      //UI

      this.form.get('descripcionProducto').setValue(data.description);
      if (
        this.form.get('nombreComercialProducto').value === '' ||
        this.form.get('producto').value !== data.code
      ) {
        this.form.get('nombreComercialProducto').setValue(data.description);
      }
      this.form.get('producto').setValue(data.code);
      this.appProduct = data.appProduct;

      this.item.appProductsGetDto = this.appProduct;
      this.uiIdProducto = data.id;
      this.uiImageLink = data.link || this.generalService.noImageUrl();
      this.uiNombreProductoInCard =
        this.appProduct.description1 + ' ' + this.appProduct.description2;
      this.btnUmDisabled = false;
      this.decripcionProductionUnit = data.decripcionProductionUnit;
      //para la calculadora
      this.dtoCalculadora.appProductId = data.id;
      this.dtoCalculadora.appUnitIdUntil = data.idUnidadMedida;

      this.requiereDatosEntrada = data.requiereDatosEntrada;

      if (this.appProduct && !this.requiereDatosEntrada) {
        this.form.get('medidaBasica').setValue(0);
        this.form.get('medidaOpuesta').setValue(0);
      }

      this.appProductConversionGetDto = this.appProduct.conversiones[0];
      this.form
        .get('unidad')
        .setValue(
          this.appProductConversionGetDto.appUnitsAlternativaDescription,
        );
      this.uiIdUnidad = this.appProductConversionGetDto.appUnitsIdAlternativa;
      //this.descripcionSalesUnit =this.appProductConversionGetDto.appUnitsAlternativaDescription;

      //this.form.get('unidad').setValue('');
      //this.appProductConversionGetDto=null;
      //this.descripcionSalesUnit = '';
      //this.uiIdUnidad = 0;
      this.resetPrecioMasFlete();
      if (this.tieneCantidadSolicitada()) {
        this.onRecalcular('seleccion-producto-con-entradas');
      }
    }
  }

  //Buscador de productos OK
  async onBuscarProducto() {
    if (this.operacion === 1) {
      this.generalService.presentToast(
        'Para cambiar el producto, elimine este ítem y agregue uno nuevo.',
        'warning',
      );
      return;
    }

    const modal = await this.modalCtrl.create({
      component: BuscadorProductosPage,
      cssClass: 'modal-amplio',
      componentProps: {
        userConectado: this.generalService.GetUsuario().user,
        subcategoryId: this.subCategoryid,
      },
    });

    await modal.present();

    //---

    const { data } = await modal.onDidDismiss();

    if (data.isValid) {
      //UI

      if (
        this.form.get('nombreComercialProducto').value === '' ||
        this.form.get('producto').value !== data.code
      ) {
        this.form.get('nombreComercialProducto').setValue(data.descripcion);
      }

      this.form.get('producto').setValue(data.code);
      this.form.get('descripcionProducto').setValue(data.descripcion);

      //Propiedades
      this.appProduct = data.appProduct;

      this.item.appProductsGetDto = this.appProduct;
      this.uiIdProducto = data.id;
      this.uiImageLink = data.link || this.generalService.noImageUrl();
      this.uiNombreProductoInCard =
        this.appProduct.description1 + ' ' + this.appProduct.description2;
      this.btnUmDisabled = false;
      this.decripcionProductionUnit = data.decripcionProductionUnit;
      //para la calculadora
      this.dtoCalculadora.appProductId = data.id;
      this.dtoCalculadora.appUnitIdUntil = data.idUnidadMedida;

      this.requiereDatosEntrada = data.requiereDatosEntrada;

      if (this.appProduct && !this.requiereDatosEntrada) {
        this.form.get('medidaBasica').setValue(0);
        this.form.get('medidaOpuesta').setValue(0);
      }

      this.appProductConversionGetDto = this.appProduct.conversiones[0];
      this.form
        .get('unidad')
        .setValue(
          this.appProductConversionGetDto.appUnitsAlternativaDescription,
        );
      this.uiIdUnidad = this.appProductConversionGetDto.appUnitsIdAlternativa;
      this.descripcionSalesUnit =
        this.appProductConversionGetDto.appUnitsAlternativaDescription;

      this.resetPrecioMasFlete();
      if (this.tieneCantidadSolicitada()) {
        this.onRecalcular('seleccion-producto');
      }
    }
  }

  //Buscar unidad de medfappProductida OK
  async onBuscarUnidadConEntradas() {
    const modal = await this.modalCtrl.create({
      component: BuscadorUnidadesPage,
      componentProps: {
        userConectado: this.generalService.GetUsuario().user,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data.isValid) {
      this.btnCalculadoraDisabled = false;

      //paso datos seleccionados a la ui
      this.form.get('unidad').setValue(data.descripcion);
      this.descripcionSalesUnit = data.descripcion;
      //propiedades
      this.uiIdUnidad = data.id;

      //para la calculadora
      this.dtoCalculadora.appUnitIdSince = data.id;

      //Llama a la calculadora
      //this.calculadoraModal();
    }
  }
  async onBuscarUnidad() {
    const modal = await this.modalCtrl.create({
      component: BuscadorUnidadesComponent,
      componentProps: {
        userConectado: this.generalService.GetUsuario().user,
        producto: this.uiIdProducto,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.btnCalculadoraDisabled = false;

      if (this.form.get('unidad').value !== data.descripcion) {
        this.form.get('precioUsd').setValue(0);
      }
      //paso datos seleccionados a la ui
      this.form.get('unidad').setValue(data.descripcion);

      this.appProductConversionGetDto = data.appProductConversion;
      this.descripcionSalesUnit = data.descripcion;
      this.decripcionProductionUnit =
        data.appProductConversion.appUnitsBaseDescription;

      //propiedades
      this.uiIdUnidad = data.appProductConversion.appUnitsIdAlternativa;

      //para la calculadora
      this.dtoCalculadora.appUnitIdSince =
        data.appProductConversion.appUnitsIdAlternativa;
      this.subjectKeyUp.next('onBuscarUnidad');
    }
  }

  decimalCount = (num) => {
    // Convert to String
    const numStr = String(num);
    // String Contains Decimal
    if (numStr.includes('.')) {
      let longitud = numStr.split('.')[1].length;
      if (longitud > 3) {
        longitud = 3;
      }
      if (longitud <= 2) {
        longitud = 2;
      }
      return longitud;
    }
    // String Does Not Contain Decimal
    return 0;
  };

  setCantidad() {
    const calculoConversion = this.calculaConversion(
      this.form.get('cantidadSolicitada').value,
      this.form.get('medidaBasica').value,
      this.form.get('medidaOpuesta').value,
    );
    if (calculoConversion.resulCantidad) {
      const cantidadPorUnidad = calculoConversion.resulCantidad;

      this.cantidadPorUnidadProduccion = calculoConversion.resulCantidad;
      this.item.valorConvertido = calculoConversion.area;
      const cantidad =
        this.form.get('cantidadSolicitada').value /
        this.cantidadPorUnidadProduccion;
      return cantidad;
    }

    return 0;
  }

  recalculoPrecioPorProductoCantidadLargoAncho() {
    this.form.get('cantidad').setValue(0);

    const filter = {
      idMunicipio: this.cotizacion.idMunicipio,
      appProuctId: this.appProduct.id,
      cantidad: this.form.get('cantidadSolicitada').value,
      largo: this.form.get('medidaBasica').value,
      ancho: this.form.get('medidaOpuesta').value,
      appDetailQuotesId: this.item.id,
      unidadId: this.uiIdUnidad,
      condicionDePago: this.form.get('condicionPago').value,
      ordenAnterior: this.form.get('ordenAnterior').value,
    };

    this.buscarPrecioConEstado(filter, 'Buscando precio........').subscribe(
      (resp) => {
        const precioDto = this.buildPrecioDtoDesdeRespuestaPrecio(resp.data);
        this.guardarPrecioMasFlete(precioDto);

        this.aplicarPrecioBaseDesdeRespuesta(resp.data);
        this.newPrecioMasFlete =
          this.detalleBusinessRules.truncarLimiteComercial(
            resp.data.precioMasFlete,
          );
        this.porDebajoDeCantidadMinima = resp.data.porDebajoDeCantidadMinima;

        if (
          this.appProduct.requiereEstimacion === true ||
          resp.data.porDebajoDeCantidadMinima === true
        ) {
          this.resetPrecioParaEstimacion(0.00000000001);
          this.precioPorUnidad = 0;
          this.cantidadPorUnidad = resp.data.cantidadPorUnidad;
          this.aplicarPrecioEstimacion(
            resp.data.porcFlete ?? this.cotizacion.porcFlete,
          );
        } else {
          this.flete = resp.data.flete;
          this.newPrecioMasFlete =
            this.detalleBusinessRules.truncarLimiteComercial(
              resp.data.precioMasFlete,
            );

          this.uiUnitPriceConverted =
            this.newPrecioMasFlete / this.form.get('cantidad').value;
          //this.uiUnitPriceConverted = this.precioMasFlete /  this.cantidadPorUnidadProduccion;
          this.precioPorUnidad = resp.data.precioPorUnidad;
          this.cantidadPorUnidad = resp.data.cantidadPorUnidad;
        }
        this.aplicarCantidadConvertidaDesdeRespuesta(resp.data, {
          aplicarConversionMillar: true,
        });
        this.actualizarEstadoCantidadMinima(resp.data);

        if (this.porDebajoDeCantidadMinima) {
          this.aplicarBloqueoPrecioPorCantidadMinima(resp.data.calculoId);
        }

        if (!this.porDebajoDeCantidadMinima) {
          this.form.get('precio').setValue(this.newPrecioMasFlete);
          this.form
            .get('total')
            .setValue(
              this.form.get('precio').value * this.form.get('cantidad').value,
            );
        }

        this.actualizarMontosPorMoneda();
        this.setColorToolbar();
      },
    );
  }
  recalculoPrecioPorProductoCantidad() {
    const cantidad = this.calculoConversionGenerico(
      this.appProductConversionGetDto,
      this.form.get('cantidadSolicitada').value,
    );

    this.form.get('cantidad').setValue(cantidad);
    this.cantidadPorUnidadProduccion = cantidad;
    this.item.valorConvertido = this.appProductConversionGetDto.yDenominador;

    const align = 'left';
    this.optionsMask = {
      prefix: '',
      thousands: '.',
      decimal: ',',
      align,
      precision: this.decimalCount(this.cantidadPorUnidadProduccion),
    };
    const longitud = this.decimalCount(this.form.get('cantidad').value);
    this.longituDecimal = longitud.toString();

    /*const filter = {
      appProuctId: this.uiIdProducto,
      cantidad: this.form.get('cantidadSolicitada').value,
      appDetailQuotesId: this.item.id,
      unidadId: this.uiIdUnidad,
      condicionDePago: this.form.get('condicionPago').value,
      ordenAnterior: this.form.get('ordenAnterior').value,
    };*/

    const filter = {
      idMunicipio: this.cotizacion.idMunicipio,
      appProuctId: this.appProduct.id,
      cantidad: this.form.get('cantidadSolicitada').value,
      largo: this.form.get('medidaBasica').value,
      ancho: this.form.get('medidaOpuesta').value,
      appDetailQuotesId: this.item.id,
      unidadId: this.uiIdUnidad,
      condicionDePago: this.form.get('condicionPago').value,
      ordenAnterior: this.form.get('ordenAnterior').value,
    };

    this.buscarPrecioConEstado(filter, 'Buscando precio ........', true).subscribe(
      (resp) => {
        const calculoIdResponse = resp.data.calculoId || 0;

        const precioDto = this.buildPrecioDtoDesdeRespuestaPrecio(resp.data, {
          calculoId: calculoIdResponse,
        });
        this.aplicarPrecioMasFlete(precioDto);
        this.item.unitPriceBaseProduction = this.unitPriceBaseProduction;
        this.item.porcMaximoSobrePrecio = this.porcMaximoSobrePrecio;
        this.guardarPrecioMasFlete(precioDto);

        if (
          this.appProduct.requiereEstimacion === true ||
          resp.data.porDebajoDeCantidadMinima
        ) {
          this.resetPrecioParaEstimacion();
          if (this.aplicarPrecioEstimacion(this.cotizacion.porcFlete)) {
            this.flete =
              (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;

            const precioEstimacionDto =
              this.buildPrecioDtoDesdeRespuestaPrecio(resp.data, {
                porcFlete: this.cotizacion.porcFlete,
              });
            this.guardarPrecioMasFlete(precioEstimacionDto);
          }
        }

        this.aplicarCantidadConvertidaDesdeRespuesta(resp.data, {
          soloCantidadPositiva: true,
          usarCantidadComoAlternativaSiNoExiste: true,
        });
        this.actualizarEstadoCantidadMinima(resp.data);

        if (this.porDebajoDeCantidadMinima) {
          this.aplicarBloqueoPrecioPorCantidadMinima(calculoIdResponse);
        }

        this.actualizarMontosPorMoneda();

        this.setColorToolbar();
      },
    );
  }

  recalculoPrecioPorProductoCantidadRollo() {
    this.form.get('cantidad').setValue(0);

    const filter = {
      idMunicipio: this.cotizacion.idMunicipio,
      appProuctId: this.appProduct.id,
      cantidad: this.form.get('cantidadSolicitada').value,
      appDetailQuotesId: this.item.id,
      unidadId: this.uiIdUnidad,
      condicionDePago: this.form.get('condicionPago').value,
      ordenAnterior: this.form.get('ordenAnterior').value,
    };

    this.buscarPrecioConEstado(
      filter,
      'Buscando precio por rollo........',
    ).subscribe((resp) => {
      const precioDto = this.buildPrecioDtoDesdeRespuestaPrecio(resp.data);
      this.aplicarPrecioMasFlete(precioDto);
      this.item.unitPriceBaseProduction = this.unitPriceBaseProduction;
      this.item.porcMaximoSobrePrecio = this.porcMaximoSobrePrecio;
      this.guardarPrecioMasFlete(precioDto);

      this.porDebajoDeCantidadMinima = resp.data.porDebajoDeCantidadMinima;
      if (
        this.appProduct.requiereEstimacion === true ||
        resp.data.porDebajoDeCantidadMinima === true
      ) {
        this.unitPriceBaseProduction = 0;
        this.precioMaximo = 0;
        this.fleteMaximo = 0;
        this.flete = 0;

        const precioSinEstimacionDto = this.buildPrecioDto({
          unitPriceBaseProduction: 0,
          precioMasFlete: 0,
          calculoId: resp.data.calculoId,
          flete: 0,
          porcFlete: 0,
          precioMaximo: 0,
          precioMaximoMasFlete: 0,
          porDebajoDeCantidadMinima: this.porDebajoDeCantidadMinima,
        });
        this.guardarPrecioMasFlete(precioSinEstimacionDto);

        this.resetPrecioParaEstimacion(0, resp.data.calculoId);
        this.precioPorUnidad = 0;
        this.aplicarPrecioEstimacion(this.cotizacion.porcFlete);
      }

      this.aplicarCantidadConvertidaDesdeRespuesta(resp.data);
      this.actualizarEstadoCantidadMinima(resp.data);

      if (this.porDebajoDeCantidadMinima) {
        this.aplicarBloqueoPrecioPorCantidadMinima(resp.data.calculoId);
      }

      if (!this.porDebajoDeCantidadMinima) {
        this.form.get('precio').setValue(this.newPrecioMasFlete);
        this.form
          .get('total')
          .setValue(
            this.form.get('precio').value * this.form.get('cantidad').value,
          );
      }
      this.uiUnitPriceConverted =
        this.newPrecioMasFlete / this.form.get('cantidad').value;
      //this.uiUnitPriceConverted = this.precioMasFlete /  this.cantidadPorUnidadProduccion;
      this.actualizarMontosPorMoneda();
      this.setColorToolbar();
    });
  }

  calculaTotalVenta(precioRecibido: number) {
    const totalVenta = this.detalleBusinessRules.calcularTotalVenta({
      precioUsd: precioRecibido,
      cantidad: this.form.get('cantidad').value,
      cantidadSolicitada: this.form.get('cantidadSolicitada').value,
      tasa: this.tasa,
      ultimoPrecioUsd: this.ultimoPrecioUsd,
      tipoCalculo: this.appProduct?.tipoCalculo,
      idUnidad: this.uiIdUnidad,
    });

    if (totalVenta.actualizarPrecio) {
      this.ultimoPrecioUsd = totalVenta.ultimoPrecioUsd;
      this.form.get('precio').setValue(totalVenta.precio);
    }

    this.form.get('cantidad').setValue(totalVenta.cantidad);
    this.form.get('total').setValue(totalVenta.total);
    this.form.get('totalUsd').setValue(totalVenta.totalUsd);
  }
  //------------------------------------
  private resetCantidadesCalculadas(): void {
    this.form.get('cantidad').setValue(0);
    this.form.get('cantidadConvertidaAlternativa').setValue(0);
  }

  private tieneCantidadSolicitada(): boolean {
    return this.form.get('cantidadSolicitada').value > 0;
  }

  private tieneMedidasYCantidad(): boolean {
    return (
      this.form.get('medidaBasica').value > 0 &&
      this.form.get('medidaOpuesta').value > 0 &&
      this.tieneCantidadSolicitada()
    );
  }

  onRecalcular(origenLlamada: string) {
    if (this.appProduct) {
      this.resetCantidadesCalculadas();

      switch (this.appProduct.tipoCalculo) {
        //RequiereEntradaLargoAncho=1
        case 1:
          if (this.tieneMedidasYCantidad()) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
            this.setColorToolbar();
          }

          break;
        //PrecioPorProducto

        case 2:
          if (this.tieneCantidadSolicitada()) {
            this.recalculoPrecioPorProductoCantidad();
          }

          break;

        //PrecioPorProductoCantidad
        case 3:
          if (this.tieneCantidadSolicitada()) {
            this.recalculoPrecioPorProductoCantidad();
            this.setColorToolbar();
          }

          break;
        case 4:
          if (this.tieneMedidasYCantidad()) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
            this.setColorToolbar();
          }

          break;
        case 12:
          if (this.tieneCantidadSolicitada()) {
            this.recalculoPrecioPorProductoCantidad();
            this.setColorToolbar();
          }
          break;
        case 5:
          if (this.tieneCantidadSolicitada()) {
            this.recalculoPrecioPorProductoCantidadRollo();
          }

          break;
        //ETTIQUETAS PRIME
        case 6:
          if (this.tieneMedidasYCantidad()) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
            this.setColorToolbar();
          }

          break;
      }
    }
  }

  //Evento llamado desde Componente
  cantidadChanged(event: number) {
    this.form.get('total').setValue(this.form.get('precio').value * +event);

    this.form
      .get('totalUsd')
      .setValue(this.form.get('precioUsd').value * +event);
  }
  cantidadSolicitadaChanged(event: number) {
    this.subjectKeyUp.next('cantidadSolicitadaChanged');
  }

  calculoConversionGenerico(
    appProductConversionGetDto: AppProductConversionGetDto,
    cantidad: number,
  ): number {
    const conversion = new Conversion(
      appProductConversionGetDto.xNumerador,
      appProductConversionGetDto.yDenominador,
      cantidad,
    );
    return conversion.getCantidadAlternativa();
  }

  calculaConversion(
    cantidadSolicitada: number,
    medidaBasica: number,
    medidaOpuesta: number,
  ): ResultConversionUnidadesMetrosCuadrados {
    if (!this.parametrosMaquinas.medidaBasicaRollo) {
      this.parametrosMaquinas = {
        adicionalProduccion: 0.635,
        adicionalProduccionOpuesta: 1.27,
        medidaOpuestaRollo: 22.2758,
        medidaBasicaRollo: 448.9176,
      };
    }

    if (cantidadSolicitada <= 0) {
      return null;
    }
    if (medidaBasica <= 0) {
      return null;
    }
    if (medidaOpuesta <= 0) {
      return null;
    }

    const conversion = new ConversionUnidadesMetrosCuadrados(
      this.parametrosMaquinas.adicionalProduccion,
      this.parametrosMaquinas.adicionalProduccionOpuesta,
      this.parametrosMaquinas.medidaBasicaRollo,
      this.parametrosMaquinas.medidaOpuestaRollo,
    );

    conversion.cantidadBase = cantidadSolicitada;
    conversion.medidaBasica = medidaBasica;
    conversion.medidaOpuesta = medidaOpuesta;
    const result = conversion.getCantidadPorUnidad();
    const area = conversion.area;
    return {
      area,
      resulCantidad: result,
    };
  }

  medidaBasicaChanged($event) {
    this.subjectKeyUp.next('medidaBasicaChanged');
  }
  medidaOpuestaChanged($event) {
    this.subjectKeyUp.next('medidaOpuestaChanged');
  }
  //Evento llamado desde Componente
  precioUsdChanged(event: number) {
    this.precio = +event;
    this.calculaTotalVenta(this.precio);
    this.setColorToolbar();
  }

  imprimirCotiza(cotizacion) {
    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/menu/imprimir-cotizacion'], { state: {} });
    //this.router.navigate(['/cotizacion-postergar'], { state: { cotizacion } })
  }
  //Evento llamado desde Componente
  precioChanged(event: number) {
    this.precio = +event;
    this.subjectKeyUp.next('precioChanged');
  }

  redondear(numero: number, precision: number) {
    return +numero / Math.pow(10, +precision);
  }

  onBuscarCaracteristicas() {
    const detalleEspecificaciones = this.item;
    this.router.navigate(['/menu/especificaciones'], {
      state: {
        cotizacion: {
          ...this.cotizacion,
          appDetailQuotesGetDto: [detalleEspecificaciones],
        },
      },
    }); //1 edit
  }

  onBuscarordenAnterior() {
    this.router.navigate(['/menu/repeticiones'], {
      state: { cotizacion: this.cotizacion },
    }); //1 edit
  }
}
