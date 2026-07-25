/* eslint-disable @typescript-eslint/member-ordering */
import {
  Conversion,
  ConversionUnidadesMetrosCuadrados,
} from 'src/app/models/conversion';
import { debounceTime } from 'rxjs/operators';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AppProdutsQueryFilter } from '../../../interfaces/app-produts-query-filter';
import { AppProductsGetDto } from '../../../models/app-products-get-dto';
import { IUsuario } from '../../../interfaces/iusuario';
import { ProductoService } from '../../../services/producto.service';
import { GeneralService } from '../../../services/general.service';
import {
  ToastController,
  ActionSheetController,
  AlertController,
  ModalController,
  IonSelect,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MunicipioGetDto } from '../../../models/municipio-get-dto';
import { BuscadorMunicipioComponent } from '../../../components/buscador-municipio/buscador-municipio.component';
import { AppSubcategoryGetDto } from 'src/app/models/app-subcategory-get-dto';
import { AppVariableSearchGroupByVariableGetDto } from 'src/app/models/app-variable-search-group-by-variable-get-dto';
import { AppVariableSearchQueryFilter } from 'src/app/interfaces/app-variable-search-query-filter';
import { AppVariableSearchGetDto } from 'src/app/models/app-variable-search-get-dto';
import { AppProductConversionGetDto } from 'src/app/models/app-product-conversion-get-dto';
import { Observable, Subject } from 'rxjs';
import { ParametrosMaquinas } from 'src/app/models/ParametrosMaquina.dto';
import { ResultConversionUnidadesMetrosCuadrados } from '../../../models/result-conversion-unidades-metros-cuadrados-dto';
import { AppPriceDto } from 'src/app/models/app-price-dto';
import { BuscadorUnidadesComponent } from 'src/app/components/buscador-unidades/buscador-unidades.component';
import { CondicionPagoQueryFilter } from 'src/app/interfaces/condicion-pago-query-filter';
import { CondicionPagoDto } from 'src/app/models/CondicionPagoDto';
import { CondicionesPagoService } from 'src/app/services/condiciones-pago.service';
import { GetPriceQueryFilter } from 'src/app/interfaces/get-price-fileter';
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  appProdutsQueryFilter: AppProdutsQueryFilter;
  appProductsGetDto: AppProductsGetDto[] = [];
  appProductsGetDtoNew: AppProductsGetDto[] = [];
  itemMunicipioGetDto: MunicipioGetDto;
  appSubcategoryGetDto: AppSubcategoryGetDto[] = [];
  condicionPagoQueryFilter: CondicionPagoQueryFilter;
  condicionPagoDto: CondicionPagoDto;
  listCondicionPagoDto: CondicionPagoDto[] = [];
  public condicionPagoCodigo: number = 0;
  public uiIdUnidad: any;
  public listaVariablesAgrupado: AppVariableSearchGroupByVariableGetDto[] = [];
  public listAppVariableSearchGetDto: AppVariableSearchGetDto[] = [];
  private qryFilter = new AppVariableSearchQueryFilter();
  public listaProductos: AppProductsGetDto[];
  public appProductConversionGetDto: AppProductConversionGetDto;
  public appProduct: AppProductsGetDto;
  public precioMaximoMasFlete: number;
  public calculoId: number;
  usuario: IUsuario;
  tituloVentaEdicion: string;
  public showLoading: boolean = false;
  public subCategoryid: any;
  form: FormGroup;
  private subjectKeyUp = new Subject<any>();
  private parametrosMaquinas: ParametrosMaquinas = new ParametrosMaquinas();
  public cantidadPorUnidadProduccion: number = 0;
  public valorConvertido: number = 0;
  public appPriceDto: AppPriceDto[] = [];
  public unitPriceBaseProduction: number;
  public flete: number;
  public precioMasFlete: any;
  public uiUnitPriceConverted: number;
  public mensaje: string;
  public buscandoPrecio: boolean = false;

  constructor(
    private productoService: ProductoService,
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    public generalService: GeneralService,
    public toastController: ToastController,
    private router: Router,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private condicionesPago: CondicionesPagoService,
  ) {
    this.usuario = this.generalService.GetUsuario();
    this.buildForm();
  }

  ngOnInit() {
    this.parametrosMaquinas ==
      JSON.parse(localStorage.getItem('parametrosMaquinas'));
    this.subjectKeyUp.pipe(debounceTime(1000)).subscribe((d) => {
      console.log('recalculando para cantidad :', d);

      this.onRecalcular(d);
    });

    this.condicionPagoQueryFilter = {
      codigo: 0,
    };
    this.condicionesPago
      .GetAllCondicionPago(this.condicionPagoQueryFilter)
      .subscribe((resp) => {
        this.listCondicionPagoDto = resp.data;
        console.log(
          'this.condicionPagoDto en calculadora',
          this.listCondicionPagoDto,
        );
      });

    const subcategoryAll = JSON.parse(localStorage.getItem('listSubcategoria'));
    //this.appSubcategoryGetDto = subcategoryAll.filter(x=> x.active==true);

    const categorySorted = subcategoryAll.sort((a, b) =>
      a.description < b.description ? -1 : 1,
    );
    this.appSubcategoryGetDto = categorySorted.filter((x) => x.active === true);

    this.productoService.allProducts$.subscribe((allProducts) => {
      this.appProductsGetDto = allProducts.data;
      console.log('productos al cargar busqueda', this.appProductsGetDto);
    });

    this.appProdutsQueryFilter = {
      pageSize: 20,
      pageNumber: 1,
      id: 0,
      code: '',
      description1: '',
      description2: '',
      searchText: '',
    };

    this.refresh();
  }

  onChangeCondicionPago(event) {
    //this.generalCotizacion.idCondPago = event.target.value;

    this.condicionPagoCodigo = event.target.value;
    this.form.get('condicionPago').setValue(event.target.value);
    this.condicionPagoDto = this.listCondicionPagoDto.find(
      (x) => x.codigo === this.condicionPagoCodigo,
    );
    this.subjectKeyUp.next('onChangeCondicionPago');
    console.log(
      'this.condicionPagoCodigo seleccionada',
      this.condicionPagoCodigo,
    );
  }
  onChangeSubCategoriaId(event) {
    //Establezco ID de sub-categoria
    this.subCategoryid = event.detail.value;
    this.qryFilter.appSubCategoryId = this.subCategoryid;
    this.listaProductos = [];
    this.appProduct = null;
    this.appPriceDto = [];
    this.unitPriceBaseProduction = 0;
    this.flete = 0;
    this.precioMasFlete = 0;
    this.uiUnitPriceConverted = 0;
    this.listAppVariableSearchGetDto = [];
    this.form.get('unidad').setValue('');
    this.form.get('cantidad').setValue(0);
    this.form.get('cantidadSolicitada').setValue(0);
    this.showLoading = true;
    this.productoService
      .GetAllAppVariableSearchAgrupado(this.qryFilter)
      .subscribe((res) => {
        this.showLoading = false;
        this.listaVariablesAgrupado = res.data;
      });
  }

  onChangeSearchText(event) {
    this.appProdutsQueryFilter.searchText = event.target.value;
    this.refresh();
  }

  refresh() {
    this.showLoading = true;
    this.appProdutsQueryFilter.subCategoria = this.subCategoryid;
    this.productoService.GetAllAppProductsVertical(this.appProdutsQueryFilter);
    this.showLoading = false;
  }

  marcado() {
    return { 'background-color': 'green', color: 'white', padding: '10px' };
  }

  desmarcado(): any {
    return { 'background-color': 'white', color: 'black', padding: '10px' };
  }
  onChangeVariableId(event) {
    this.listAppVariableSearchGetDto = this.listAppVariableSearchGetDto.filter(
      (item) => item.appVariableId !== event.detail.value.appVariableId,
    );

    this.listAppVariableSearchGetDto.push(event.detail.value);

    console.log(
      'Al seleccionar variable this.listAppVariableSearchGetDto: ',
      this.listAppVariableSearchGetDto,
    );

    this.buscar();
  }

  onSelect(producto: AppProductsGetDto) {
    this.appProduct = producto;
    this.appProductConversionGetDto = producto.conversiones[0];
    this.uiIdUnidad = this.appProductConversionGetDto.appUnitsIdAlternativa;
    this.form
      .get('unidad')
      .setValue(this.appProductConversionGetDto.appUnitsAlternativaDescription);
    this.form
      .get('unidadId')
      .setValue(this.appProductConversionGetDto.appUnitsIdAlternativa);
    this.appPriceDto = producto.appPriceDto;
    this.subjectKeyUp.next('cantidadSolicitadaChanged');
  }
  medidaBasicaChanged($event) {
    this.subjectKeyUp.next('medidaBasicaChanged');
  }
  medidaOpuestaChanged($event) {
    this.subjectKeyUp.next('medidaOpuestaChanged');
  }

  buscar() {
    //Hago peticion a la api  para q me entregue la lista de productos resultante
    //asociados a los criterios indicados

    const objeto = {
      filters: this.listAppVariableSearchGetDto,
      subcategoryId: this.subCategoryid,
    };
    console.log('Filter a enviar para buscar productos', objeto);
    this.listaProductos = [];
    this.showLoading = true;
    this.productoService.GetAllProductusByCriteria(objeto).subscribe((res) => {
      this.showLoading = false;
      this.listaProductos = res.data;
    });
  }
  async onBuscarMunicipio() {
    const modal = await this.modalCtrl.create({
      component: BuscadorMunicipioComponent,
      componentProps: {
        userConectado: this.usuario.user,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    this.itemMunicipioGetDto = data.itemMunicipio;
    this.form.get('idMunicipio').setValue(data.itemMunicipio.recnum);
    this.form
      .get('descripcionMunicipio')
      .setValue(data.itemMunicipio.descMunicipio);
  }

  save(event) {}
  private buildForm() {
    this.form = this.formBuilder.group({
      idMunicipio: [0, []],
      descripcionMunicipio: ['', []],
      condicionPago: [40, [Validators.required]],
      subCategoriaId: ['', []],
      unidad: ['', [Validators.required, Validators.minLength(2)]],
      cantidadSolicitada: [1, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.00000000001)]],
      medidaBasica: ['', []],
      medidaOpuesta: ['', []],
      precio: [0, []],
      total: [0, []],
      unidadId: [0, []],
    });
  }

  //------------------------------------
  async onRecalcular(origenLlamada: string) {
    this.LimpiarVariables();
    if (this.appProduct != null && this.appProductConversionGetDto != null) {
      console.log('tipo de calculo onRecalcular ', this.appProduct.tipoCalculo);
      switch (this.appProduct.tipoCalculo) {
        //RequiereEntradaLargoAncho=1
        case 1:
          this.form.get('cantidad').setValue(0);
          if (
            this.form.get('medidaBasica').value > 0 &&
            this.form.get('medidaOpuesta').value > 0 &&
            this.form.get('cantidadSolicitada').value > 0
          ) {
            this.recalculoRequiereEntradaLargoAncho();
            //this.recalculoPrecioPorProductoCantidadLargoAncho();
          }

          break;
        //PrecioPorProducto

        case 2:
          this.form.get('cantidad').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPorRango();
          }

          break;

        //PrecioPorProductoCantidad
        case 3:
          this.form.get('cantidad').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPrecioPorProductoCantidad();
          }

          break;
        case 4:
          this.form.get('cantidad').setValue(0);
          if (
            this.form.get('medidaBasica').value > 0 &&
            this.form.get('medidaOpuesta').value > 0 &&
            this.form.get('cantidadSolicitada').value > 0
          ) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
          }

          break;
        case 12:
          this.form.get('cantidad').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPrecioPorProductoCantidad();
          }
          break;
        case 5:
          this.form.get('cantidad').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPrecioPorProductoCantidadLargoRollo();
          }
          break;
        case 6:
          this.form.get('cantidad').setValue(0);
          if (
            this.form.get('medidaBasica').value > 0 &&
            this.form.get('medidaOpuesta').value > 0 &&
            this.form.get('cantidadSolicitada').value > 0
          ) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
          }
          break;
      }
    }
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
    const resultObject: ResultConversionUnidadesMetrosCuadrados = {
      area,
      resulCantidad: result,
    };

    return resultObject;
  }

  recalculoRequiereEntradaLargoAncho() {
    if (this.appProduct.tipoCalculo === 1) {
      const calculoConversion = this.calculaConversion(
        this.form.get('cantidadSolicitada').value,
        this.form.get('medidaBasica').value,
        this.form.get('medidaOpuesta').value,
      );

      //let cantidadPorUnidad= calculoConversion.resulCantidad;
      this.cantidadPorUnidadProduccion = calculoConversion.resulCantidad;
      this.valorConvertido = calculoConversion.area;
    }

    let porrcentajeAprovechamiento = 0;
    const cantidadPorUnidad = 0;
    let cantidad = 0;
    porrcentajeAprovechamiento =
      this.cantidadPorUnidadProduccion * this.valorConvertido;
    cantidad =
      this.form.get('cantidadSolicitada').value /
      this.cantidadPorUnidadProduccion /
      porrcentajeAprovechamiento;
    this.form
      .get('cantidad')
      .setValue(
        this.form.get('cantidadSolicitada').value /
          this.cantidadPorUnidadProduccion,
      );

    if (this.itemMunicipioGetDto.porcFlete > 0) {
      this.flete =
        (this.unitPriceBaseProduction * this.itemMunicipioGetDto.porcFlete) /
        100;
    }

    if (this.appPriceDto != null && this.appPriceDto.length > 0) {
      const precio = this.buscarPrecioPorRango(
        this.appPriceDto,
        this.form.get('cantidad').value,
      );
      const precioMaximo = this.buscarPrecioMaximoPorRango(
        this.appPriceDto,
        this.form.get('cantidad').value,
      );
      this.precioMaximoMasFlete = precioMaximo + this.flete;
      this.unitPriceBaseProduction = precio;
    }

    this.precioMasFlete = this.unitPriceBaseProduction + this.flete;
    this.precioMasFlete = this.precioMasFlete.toFixed(2);
    this.uiUnitPriceConverted =
      this.precioMasFlete / this.cantidadPorUnidadProduccion;
    this.form.get('precio').setValue(this.precioMasFlete);
    this.form
      .get('total')
      .setValue(
        this.form.get('precio').value * this.form.get('cantidad').value,
      );
  }

  LimpiarVariables() {
    this.flete = 0;
    this.precioMasFlete = 0;
    this.uiUnitPriceConverted = 0;
    this.unitPriceBaseProduction = 0;
    this.form.get('precio').setValue(0);
    this.form.get('total').setValue(0);
    this.form.get('cantidad').setValue(0);
  }

  recalculoPorRango() {
    this.mensaje = 'Buscando precio........';
    const cantidad = this.calculoConversionGenerico(
      this.appProductConversionGetDto,
      this.form.get('cantidadSolicitada').value,
    );

    this.form.get('cantidad').setValue(cantidad);

    this.cantidadPorUnidadProduccion = cantidad;
    this.valorConvertido = this.appProductConversionGetDto.yDenominador;
    const precio = this.buscarPrecioPorRango(
      this.appPriceDto,
      this.form.get('cantidad').value,
    );
    let precioMaximo = this.buscarPrecioMaximoPorRango(
      this.appPriceDto,
      this.form.get('cantidad').value,
    );

    this.unitPriceBaseProduction =
      precio + (precio * this.condicionPagoDto.pocGapAplicarPrecio) / 100;

    precioMaximo =
      precioMaximo +
      (precioMaximo * this.condicionPagoDto.pocGapAplicarPrecio) / 100;

    console.log('Producto seleccionado>>>>>>>>>', this.appProduct);
    let porcFlete = 0;
    porcFlete = this.itemMunicipioGetDto.porcFlete;
    if (this.appProduct.porcFlete > 0) {
      porcFlete = this.appProduct.porcFlete;
    }

    this.flete = (this.unitPriceBaseProduction * porcFlete) / 100;

    this.precioMasFlete = this.unitPriceBaseProduction + this.flete;
    console.log({
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      flete: this.flete,
      precioMasFlete: this.precioMasFlete,
      porcFleteProducto: this.appProduct.porcFlete,
      porcFlete: porcFlete,
      pocGapAplicarPrecio: this.condicionPagoDto.pocGapAplicarPrecio,
    });

    this.precioMaximoMasFlete = precioMaximo + this.flete;
    this.precioMasFlete = this.precioMasFlete.toFixed(2);
    this.uiUnitPriceConverted =
      this.precioMasFlete / this.cantidadPorUnidadProduccion;
    this.form.get('precio').setValue(this.precioMasFlete);
    this.form
      .get('total')
      .setValue(
        this.form.get('precio').value * this.form.get('cantidad').value,
      );

    this.mensaje = '';
  }

  async recalculoPrecioPorProductoCantidad() {
    if (!this.validarParametrosCalculoPrecio(false)) {
      return;
    }

    const cantidad = this.calculoConversionGenerico(
      this.appProductConversionGetDto,
      this.form.get('cantidadSolicitada').value,
    );
    this.form.get('cantidad').setValue(cantidad);
    this.cantidadPorUnidadProduccion = cantidad;
    this.valorConvertido = this.appProductConversionGetDto.yDenominador;

    const filter = this.buildGetPricePayload(false);
    console.log(
      'payload getPrice - recalculoPrecioPorProductoCantidad',
      filter,
    );

    this.buscandoPrecio = true;
    this.showLoading = true;
    this.mensaje = 'Buscando precio........';
    await this.productoService.getPrice(filter).subscribe((resp) => {
      this.buscandoPrecio = false;
      this.showLoading = false;
      this.mensaje = '';
      this.aplicarResultadoGetPrice(resp, cantidad);
    });
  }

  buscarPrecioPorRango(_appPriceDto: AppPriceDto[], cantidad: number): number {
    let result: number;

    const precio = _appPriceDto.filter(
      (x) => cantidad >= x.desde && cantidad <= x.hasta,
    );

    if (precio != null && precio.length > 0) {
      result = precio[0].precio;
    } else {
      result = _appPriceDto[0].precio;
    }

    return result;
  }
  buscarPrecioMaximoPorRango(
    _appPriceDto: AppPriceDto[],
    cantidad: number,
  ): number {
    let result: number;

    const precio = _appPriceDto.filter(
      (x) => cantidad >= x.desde && cantidad <= x.hasta,
    );

    if (precio != null && precio.length > 0) {
      result = precio[0].precioMaximo;
    } else {
      result = _appPriceDto[0].precioMaximo;
    }

    return result;
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
    const result = conversion.getCantidadAlternativa();

    return result;
  }

  cantidadSolicitadaChanged(event: number) {
    this.subjectKeyUp.next('cantidadSolicitadaChanged');
  }

  async recalculoPrecioPorProductoCantidadLargoAncho() {
    if (!this.validarParametrosCalculoPrecio(true)) {
      return;
    }

    this.form.get('cantidad').setValue(0);
    const filter = this.buildGetPricePayload(true);
    console.log(
      'payload getPrice - recalculoPrecioPorProductoCantidadLargoAncho',
      filter,
    );
    console.log(
      'filter buscando precio....####### en recalculoPrecioPorProductoCantidadLargoAncho',
      filter,
    );
    this.buscandoPrecio = true;
    this.showLoading = true;
    this.mensaje = 'Buscando precio.';
    await this.productoService.getPrice(filter).subscribe((resp) => {
      this.buscandoPrecio = false;
      this.showLoading = false;
      this.mensaje = '';
      console.log('Respuesta desde GetPrice', resp);
      this.aplicarResultadoGetPrice(resp);
    });
  }

  async recalculoPrecioPorProductoCantidadLargoRollo() {
    if (!this.validarParametrosCalculoPrecio(false)) {
      return;
    }

    this.form.get('cantidad').setValue(0);
    //const cantidad= this.calculoConversionGenerico(this.appProductConversionGetDto,this.form.get('cantidadSolicitada').value);
    //this.form.get('cantidad').setValue(cantidad);
    //this.cantidadPorUnidadProduccion=cantidad;
    //this.valorConvertido=this.appProductConversionGetDto.yDenominador;
    const filter = this.buildGetPricePayload(false);
    console.log(
      'payload getPrice - recalculoPrecioPorProductoCantidadLargoRollo',
      filter,
    );
    console.log('filter buscando precio rollo', filter);
    this.buscandoPrecio = true;
    this.showLoading = true;
    this.mensaje = 'Buscando precio........';
    await this.productoService.getPrice(filter).subscribe((resp) => {
      this.buscandoPrecio = false;
      this.showLoading = false;
      this.mensaje = '';
      console.log('Respuesta desde GetPrice', resp);
      this.aplicarResultadoGetPrice(resp);
    });
  }

  private aplicarResultadoGetPrice(resp: any, cantidadFallback?: number) {
    const mensajeApi = this.obtenerMensajeApi(resp);

    if (!resp || !resp.data) {
      this.form.get('cantidad').setValue(cantidadFallback ?? 0);
      this.form.get('precio').setValue(0);
      this.form.get('total').setValue(0);
      this.mensaje = mensajeApi || 'No fue posible calcular el precio';
      return;
    }

    const data = resp.data;

    this.calculoId = data.calculoId ?? 0;
    this.unitPriceBaseProduction = data.precio ?? 0;
    this.flete = data.flete ?? 0;
    this.precioMasFlete =
      data.precioMasFlete ?? this.unitPriceBaseProduction + this.flete;
    this.precioMaximoMasFlete =
      data.precioMaximoMasFlete ?? (data.precioMaximo ?? 0) + this.flete;

    const cantidadConvertida = data.cantidadConvertida ?? cantidadFallback ?? 0;
    this.form.get('cantidad').setValue(cantidadConvertida);
    this.precioMasFlete = Number(this.precioMasFlete).toFixed(2);
    this.form.get('precio').setValue(this.precioMasFlete);
    this.form
      .get('total')
      .setValue(
        this.form.get('precio').value * this.form.get('cantidad').value,
      );
    this.mensaje = '';
  }

  private getUnidadIdSeleccionada(): number {
    const unidadId =
      this.uiIdUnidad ||
      this.form.get('unidadId').value ||
      this.appProductConversionGetDto?.appUnitsIdAlternativa ||
      0;
    return Number(unidadId);
  }

  private buildGetPricePayload(requiereMedidas: boolean): GetPriceQueryFilter {
    const unidadId = this.getUnidadIdSeleccionada();
    const largo = requiereMedidas
      ? Number(this.form.get('medidaBasica').value || 0)
      : 0;
    const ancho = requiereMedidas
      ? Number(this.form.get('medidaOpuesta').value || 0)
      : 0;

    return {
      idMunicipio: Number(this.form.get('idMunicipio').value || 0),
      appProuctId: this.appProduct.id,
      cantidad: Number(this.form.get('cantidadSolicitada').value || 0),
      largo,
      ancho,
      unidadId,
      unidad: unidadId,
      condicionDePago: Number(this.form.get('condicionPago').value || 0),
    };
  }

  private obtenerMensajeApi(resp: any): string {
    if (!resp) {
      return '';
    }
    if (resp.meta?.message) {
      return resp.meta.message;
    }
    if (resp.message) {
      return resp.message;
    }
    if (resp.error?.message) {
      return resp.error.message;
    }
    return '';
  }

  private validarParametrosCalculoPrecio(requiereMedidas: boolean): boolean {
    const idMunicipio = Number(this.form.get('idMunicipio').value || 0);
    const condicionDePago = Number(this.form.get('condicionPago').value || 0);
    const cantidadSolicitada = Number(
      this.form.get('cantidadSolicitada').value || 0,
    );
    const unidadId = this.getUnidadIdSeleccionada();
    const medidaBasica = Number(this.form.get('medidaBasica').value || 0);
    const medidaOpuesta = Number(this.form.get('medidaOpuesta').value || 0);

    if (!this.appProduct) {
      this.mensaje = 'Seleccione un producto';
      this.generalService.presentToast('Seleccione un producto', 'warning');
      return false;
    }
    if (idMunicipio <= 0) {
      this.mensaje = 'Seleccione municipio para calcular precio';
      this.generalService.presentToast(
        'Seleccione municipio para calcular precio',
        'warning',
      );
      return false;
    }
    if (condicionDePago <= 0) {
      this.mensaje = 'Seleccione condición de pago';
      this.generalService.presentToast(
        'Seleccione condición de pago',
        'warning',
      );
      return false;
    }
    if (unidadId <= 0) {
      this.mensaje = 'Seleccione unidad para calcular precio';
      this.generalService.presentToast(
        'Seleccione unidad para calcular precio',
        'warning',
      );
      return false;
    }
    if (cantidadSolicitada <= 0) {
      this.mensaje = 'Indique una cantidad solicitada mayor a cero';
      this.generalService.presentToast(
        'Indique una cantidad solicitada mayor a cero',
        'warning',
      );
      return false;
    }
    if (requiereMedidas && (medidaBasica <= 0 || medidaOpuesta <= 0)) {
      this.mensaje = 'Indique medida básica y opuesta mayores a cero';
      this.generalService.presentToast(
        'Indique medida básica y opuesta mayores a cero',
        'warning',
      );
      return false;
    }

    this.mensaje = '';
    return true;
  }

  async onBuscarUnidad() {
    console.log('onBuscarUnidad');
    const modal = await this.modalCtrl.create({
      component: BuscadorUnidadesComponent,
      componentProps: {
        userConectado: this.generalService.GetUsuario().user,
        producto: this.appProduct.id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      if (this.form.get('unidad').value !== data.descripcion) {
        this.form.get('precio').setValue(0);
      }
      //paso datos seleccionados a la ui
      this.form.get('unidad').setValue(data.descripcion);
      this.uiIdUnidad = data.appProductConversion.appUnitsIdAlternativa;

      this.appProductConversionGetDto = data.appProductConversion;
      this.form
        .get('unidadId')
        .setValue(data.appProductConversion.appUnitsIdAlternativa);
      this.subjectKeyUp.next('onBuscarUnidad');
    }
  }
}
