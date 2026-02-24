import { AppConfigAppQueryFilter } from './../../../../interfaces/appConfigAppQueryFilter';
import { ModalController, AlertController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { IUsuario } from 'src/app/interfaces/iusuario';

import { CotizacionesListService } from '../../../../services/cotizaciones/cotizaciones-list.service';
import { ConfiguracionService } from '../../../../services/configuracion.service';
import { AppGeneralQuotesGetDto } from '../../../../models/app-general-quotes-get-dto';

import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { AppDetailQuotesCreateDto } from '../../../../models/app-detail-quotes-create-dto';
import { AppDetailQuotesUpdateDto } from '../../../../models/app-detail-quotes-update-dto';

import { BuscadorUnidadesPage } from '../buscador-unidades/buscador-unidades.page';

import { Observable, Subject } from 'rxjs';
import { TasaPreferencialService } from '../../../../services/tasa-preferencial.service';

import { SharedModule } from '../../../../shared/shared.module';

import { AppConversionUnitGenericCreateDto } from '../../../../models/app-conversion-unit-generic-create-dto';

import { gte } from '../validator/detail-validator';
import { AppSubcategoryGetDto } from '../../../../models/app-subcategory-get-dto';
import { ProductoService } from '../../../../services/producto.service';
import { BuscadorProductosComponent } from '../../../../components/buscador-productos/buscador-productos.component';
import { BuscadorUnidadesComponent } from '../../../../components/buscador-unidades/buscador-unidades.component';
import { ParametrosMaquinas } from '../../../../models/ParametrosMaquina.dto';
import {
  Conversion,
  ConversionUnidadesMetrosCuadrados,
} from 'src/app/models/conversion';
import { AppPriceDto } from 'src/app/models/app-price-dto';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AppRecipesByAppDetailQuotesQueryFilter } from 'src/app/interfaces/precio-producto-cantidad-filter';
import { AppProductsGetDto } from 'src/app/models/app-products-get-dto';
import { ResultConversionUnidadesMetrosCuadrados } from 'src/app/models/result-conversion-unidades-metros-cuadrados-dto';
import { AppProductConversionGetDto } from 'src/app/models/app-product-conversion-get-dto';
import { AppProductConversionFilter } from 'src/app/interfaces/app-product-conversion-filter';
import { CondicionesPagoService } from 'src/app/services/condiciones-pago.service';
import { CondicionPagoQueryFilter } from 'src/app/interfaces/condicion-pago-query-filter';
import { CondicionPagoDto } from 'src/app/models/CondicionPagoDto';
import { PrecioDto } from 'src/app/interfaces/precio';
import { BuscadorProductosPage } from '../buscador-productos/buscador-productos.page';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  @Input() cotizacion: AppGeneralQuotesGetDto;
  public item: AppDetailQuotesGetDto;

  //observable
  cotizacion$: Observable<any>;
  tasa$: Observable<any>;
  operacion: number;

  public editable: boolean;
  usuario: IUsuario;
  form: FormGroup;
  tituloUi: any;

  public isBs: boolean;
  public porDebajoDeCantidadMinima: boolean;
  public isDolar: boolean;
  public btnUmDisabled: boolean;
  public btnCalculadoraDisabled: boolean;
  public _cantidad: any = '0';
  public tasa: number;
  public flagMascara: boolean;
  public calculadoraEnabled: boolean;
  public precioMaximo: number;
  public concesion: number;
  public concesionString: string;
  salidas: string[];
  tipoForma: string[];
  colorToolbar = 'primary';

  requiereAprobacionPrecio: boolean;

  solicitarPrecio: boolean;
  currency: number;

  ultimoPrecioUsd: number;

  _precio: any = '0';
  _precioUsd: any = '0';

  _total: any = '0';
  _totalUsd: any = '0';

  datoHijo: any = 'No iniciado';
  appSubcategoryGetDto: AppSubcategoryGetDto[] = [];
  appPriceDto: AppPriceDto[] = [];
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
  public subcategorySelectIsEnabled: boolean;
  public appProduct: AppProductsGetDto = new AppProductsGetDto();

  private parametrosMaquinas: ParametrosMaquinas = new ParametrosMaquinas();
  private appGeneralQuotesGetDto: AppGeneralQuotesGetDto =
    new AppGeneralQuotesGetDto();
  private detailCreateDto: AppDetailQuotesCreateDto =
    new AppDetailQuotesCreateDto();
  private detailUpdateDto: AppDetailQuotesUpdateDto =
    new AppDetailQuotesUpdateDto();
  private dtoCalculadora: AppConversionUnitGenericCreateDto =
    new AppConversionUnitGenericCreateDto();
  private appProductConversionGetDto: AppProductConversionGetDto;
  private appConfigAppQueryFilter: AppConfigAppQueryFilter;
  private subjectKeyUp = new Subject<any>();

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
    private configuracionService: ConfiguracionService,
  ) {
    this.parametrosMaquinas = JSON.parse(
      localStorage.getItem('parametrosMaquinas'),
    );
    this.buildForm();
  }

  async ngOnInit() {
    //suscribe al observable cotizacion$
    this.cotizacionesListService.cotizacion$.subscribe((cot) => {
      this.cotizacion = cot;
    });

    this.salidas = ['A', 'B', 'C', 'D'];
    this.tipoForma = ['Regular', 'Irregular'];
    this.mostrarEnDesarrollo = true;
    this.subjectKeyUp.pipe(debounceTime(1000)).subscribe((d) => {
      this.onRecalcular(d);
    });

    //datos recibidos
    this.operacion = this.router.getCurrentNavigation().extras.state.operacion;

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
      .subscribe((resp) => {
        this.listCondicionPagoDto = resp.data;
      });

    const subcategoryAll = JSON.parse(localStorage.getItem('listSubcategoria'));
    const categorySorted = subcategoryAll.sort((a, b) =>
      a.description < b.description ? -1 : 1,
    );
    this.appSubcategoryGetDto = categorySorted.filter((x) => x.active === true);

    this.requiereDatosEntrada = false;

    if (this.cotizacion) {
      this.editable = this.cotizacion.appStatusQuoteGetDto.editable;
    } else {
      this.editable = true;
    }

    if (this.operacion === 0) {
      this.calculoId = 0;
      //Modo Crear
      this.item = new AppDetailQuotesGetDto();
      this.item.statusAprobacionDto = {
        flagAprobado: true,
        flagCerrado: false,
        valorVentaAprobar: 0,
        valorVentaAprobarUsd: 0,
        aprobado: true,
        color: 'prymary',
        statusString: 'APROBADO',
        precioEstimacion: 0,
      };
    }

    //boton calculadora`
    if (this.operacion === 1) {
      //Modo Editar
      this.item = this.router.getCurrentNavigation().extras.state.item;
      console.log('this.item recibido', this.item);

      //this.item.appProductsGetDto =this.router.getCurrentNavigation().extras.state.producto;

      this.appProduct = this.item.appProductsGetDto;
      //this.router.getCurrentNavigation().extras.state.producto;t
      // his.item.appProductsGetDto = this.appProduct;

      //this.appProduct = this.item.appProductsGetDto;
      this.calculoId = this.item.calculoId;
      this.setColorToolbar();
    }
    //suscribe al observable tasa$
    this.tasaPreferencialService.tasa$.subscribe((_tasa) => {
      this.tasa = _tasa;
    });

    await this.tasaPreferencialService.GetTasa().subscribe((resp) => {
      this.tasaPreferencialService.tasa$.next(resp.data.tasa);

      this.tasa = resp.data.tasa;

      this.uiTasa = this.tasa;
    });

    this.showData();
    this.setMostrarOrdenAnterior();

    this.configuraCreateOrEdit();
  }

  ionViewDidEnter() {
    this.cotizacionesListService.cotizacion$.subscribe((cot) => {
      this.cotizacion = cot;
    });

    this.showData();
    this.setMostrarOrdenAnterior();
  }
  onChangeCondicionPago(event) {
    this.condicionPagoDto = this.listCondicionPagoDto.find(
      (x) => x.codigo === this.condicionPagoCodigo,
    );
    this.condicionPagoCodigo = event.target.value;

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

  onChangeSalida(event) {
    console.log('onChangeSalida', event.target.value);
  }
  onChangeTipoForma(event) {
    console.log('onChangeSalida', event.target.value);
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
    this.uiTasa = 0;
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
      this.item.statusAprobacionDto = {
        flagAprobado: true,
        flagCerrado: false,
        valorVentaAprobar: 0,
        valorVentaAprobarUsd: 0,
        aprobado: true,
        color: 'prymary',
        statusString: 'APROBADO',
        precioEstimacion: 0,
      };

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

      this.uiImageLink = this.item.appProductsGetDto.link;

      this.appPriceDto = this.item.appProductsGetDto.appPriceDto;

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
    var precioDto: PrecioDto = {
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      precioMasFlete: 0,
      calculoId: this.item.calculoId,
      flete: this.flete,
      porcFlete: this.cotizacion.porcFlete,
      precioMaximo: 0,
      precioMaximoMasFlete: 0,
      porDebajoDeCantidadMinima: this.porDebajoDeCantidadMinima,
    };
    localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

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
      this.uiImageLink = this.item.appProductsGetDto.link;
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
      this.variables.permitirLectura = true;
      this.unitPriceBaseProduction = this.item.unitPriceBaseProduction;
      this.flete = this.item.flete;
      this.calculoId = this.item.calculoId;
      if (this.item.forma == null) {
        this.item.forma = '';
      }
      if (this.item.salida == null) {
        this.item.salida = '';
      }
      if (this.item.presentacion == null) {
        this.item.presentacion = '';
      }
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
        this.cotizacion.appOrdenProductoRepeticionGetDto != null
      ) {
        this.form
          .get('subCategoriaId')
          .setValue(
            this.cotizacion.appOrdenProductoRepeticionGetDto.appProductsGetDto
              .appSubCategoryId,
          );
        this.form
          .get('producto')
          .setValue(
            this.cotizacion.appOrdenProductoRepeticionGetDto.appProductsGetDto
              .code,
          );
        this.form
          .get('descripcionProducto')
          .setValue(
            this.cotizacion.appOrdenProductoRepeticionGetDto.appProductsGetDto
              .description1,
          );
        this.form
          .get('nombreComercialProducto')
          .setValue(
            this.cotizacion.appOrdenProductoRepeticionGetDto.nombreForma,
          );
        this.form
          .get('forma')
          .setValue(this.cotizacion.appOrdenProductoRepeticionGetDto.forma);
        this.form
          .get('salida')
          .setValue(this.cotizacion.appOrdenProductoRepeticionGetDto.salida);
        this.form
          .get('presentacion')
          .setValue(
            this.cotizacion.appOrdenProductoRepeticionGetDto.presentacion,
          );

        //Propiedades
        this.appProduct =
          this.cotizacion.appOrdenProductoRepeticionGetDto.appProductsGetDto;
        this.item.appProductsGetDto = this.appProduct;
        this.uiIdProducto = this.appProduct.id;
        this.uiImageLink = this.appProduct.link;
        this.uiNombreProductoInCard =
          this.appProduct.description1 +
          ' ' +
          this.item.appProductsGetDto.description2;
        this.btnUmDisabled = false;
        this.decripcionProductionUnit =
          this.appProduct.productionUnitGetDto.description1;
        this.appPriceDto = this.appProduct.appPriceDto;
        this.requiereDatosEntrada = this.appProduct.requiereDatosEntrada;

        this.appProductConversionGetDto =
          this.cotizacion.appOrdenProductoRepeticionGetDto.appProductConversionGetDto;
        this.form
          .get('unidad')
          .setValue(
            this.appProductConversionGetDto.appUnitsAlternativaDescription,
          );
        this.uiIdUnidad = this.appProductConversionGetDto.appUnitsIdAlternativa;

        if (this.appProduct != null && !this.requiereDatosEntrada) {
          this.form.get('medidaBasica').setValue(0);
          this.form.get('medidaOpuesta').setValue(0);
        } else {
          this.form
            .get('medidaBasica')
            .setValue(
              this.cotizacion.appOrdenProductoRepeticionGetDto.medidaBasicaCm,
            );
          this.form
            .get('medidaOpuesta')
            .setValue(
              this.cotizacion.appOrdenProductoRepeticionGetDto.medidaOpuestaCm,
            );
        }

        if (
          this.cotizacion.appOrdenProductoRepeticionGetDto.codProducto ===
          '4402'
        ) {
          this.form
            .get('medidaBasica')
            .setValue(
              this.cotizacion.appOrdenProductoRepeticionGetDto.medidaBasicaCm,
            );
          this.form
            .get('medidaOpuesta')
            .setValue(
              this.cotizacion.appOrdenProductoRepeticionGetDto.medidaOpuestaCm,
            );
        }
        this.form
          .get('cantidadSolicitada')
          .setValue(
            this.cotizacion.appOrdenProductoRepeticionGetDto.cantidadOrdenada,
          );

        this.descripcionSalesUnit =
          this.appProductConversionGetDto.appUnitsAlternativaDescription;
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
  }

  //Insert - ok
  onInsert(eliminarSolicitud: boolean) {
    this.setPrecioMasFlete();
    this.detailCreateDto.appGeneralQuotesId = this.cotizacion.id;
    this.detailCreateDto.cotizacion = this.cotizacion.cotizacion;
    this.detailCreateDto.condicionPago = this.condicionPagoCodigo;
    this.detailCreateDto.idProducto = this.uiIdProducto;
    this.detailCreateDto.idUnidad = this.uiIdUnidad;
    this.detailCreateDto.idEstatus = 1;
    this.detailCreateDto.producto = this.form.get('producto').value;
    this.detailCreateDto.nombreComercialProducto = this.form.get(
      'nombreComercialProducto',
    ).value;
    this.detailCreateDto.diasEntrega = this.form.get('diasEntrega').value;
    this.detailCreateDto.observaciones = this.form.get('observaciones').value;

    //
    this.detailCreateDto.cantidad = this.form.get('cantidad').value;
    this.detailCreateDto.cantidadSolicitada =
      this.form.get('cantidadSolicitada').value;
    this.detailCreateDto.precio = this.form.get('precio').value;
    this.detailCreateDto.total = this.form.get('total').value;
    this.detailCreateDto.precioUsd = this.form.get('precioUsd').value;
    this.detailCreateDto.totalUsd = this.form.get('totalUsd').value;

    this.detailCreateDto.precioLista = this.unitPriceBaseProduction;
    this.detailCreateDto.solicitarPrecio = this.solicitarPrecio;
    this.detailCreateDto.obsSolicitud = this.form.get('obsSolicitud').value;
    if (this.appProduct.requiereEstimacion === true) {
      this.detailCreateDto.obsSolicitud =
        '***SOLICITUD DE ESTIMACION****' + this.form.get('obsSolicitud').value;
    }

    if (this.appProduct != null && !this.requiereDatosEntrada) {
      this.form.get('medidaBasica').setValue(0);
      this.form.get('medidaOpuesta').setValue(0);
    }

    this.detailCreateDto.medidaBasica = this.form.get('medidaBasica').value;
    this.detailCreateDto.medidaOpuesta = this.form.get('medidaOpuesta').value;

    this.detailCreateDto.valorConvertido = this.form.get('cantidad').value;
    this.detailCreateDto.cantidadPorUnidadProduccion =
      this.cantidadPorUnidadProduccion;
    this.detailCreateDto.ordenAnterior = this.form.get('ordenAnterior').value;
    this.detailCreateDto.calculoId = this.calculoId;
    this.detailCreateDto.unitPriceBaseProductionMaximo = this.precioMaximo;
    this.detailCreateDto.forma = this.form.get('forma').value;
    this.detailCreateDto.salida = this.form.get('salida').value;
    this.detailCreateDto.presentacion = this.form.get('presentacion').value;
    const user = this.generalService.GetUsuario();
    this.detailCreateDto.usuarioConectado = user.user;
    this.showLoading = true;

    this.mensaje = 'Guardando Cotizacion';
    this.cotizacionesListService
      .InsertDetalleCotizacion(this.detailCreateDto)
      .subscribe((result) => {
        if (result.meta.isValid) {
          this.appGeneralQuotesGetDto = result.data[0];
          this.cotizacion = result.data[0];
          console.log('Result al crear', result.data);

          //capturo el registro insertado y lo asigno a 'item' (requerido en la calculadora)
          this.item = this.appGeneralQuotesGetDto.appDetailQuotesGetDto[0];

          this.cotizacionesListService.cotizacion$.next(this.cotizacion);
        }

        if (result.meta.isValid === true) {
          this.showLoading = false;

          if (this.appGeneralQuotesGetDto.mensajeSolicitarPrecio.length > 0) {
            this.generalService.presentToastLong(
              'COTIZACIÓN ENVIADA PARA APROBACIÓN POR: ' +
                this.appGeneralQuotesGetDto.mensajeSolicitarPrecio,
              'danger',
            );
          } else {
            this.generalService.presentToast(result.meta.message, 'success');
          }

          this.goListDetalleCotizacion();
        } else {
          this.showLoading = false;
          this.generalService.presentToast(result.meta.message, 'danger');
        }
        this.mensaje = '';
      });
  }

  //ok!
  onUpdateFr(eliminarSolicitud: boolean) {
    //let objetoDetailForUpdate: AppDetailQuotesUpdateDto = new AppDetailQuotesUpdateDto()

    this.setPrecioMasFlete();

    //establece cantidad, precio y total con datos de la UI
    this.detailUpdateDto.eliminarSolicitud = eliminarSolicitud;
    this.detailUpdateDto.cantidad = this.form.get('cantidad').value;
    this.detailUpdateDto.condicionPago = this.condicionPagoCodigo;
    this.detailUpdateDto.cantidadSolicitada =
      this.form.get('cantidadSolicitada').value;
    this.detailUpdateDto.precio = this.form.get('precio').value;
    this.detailUpdateDto.total = this.form.get('total').value;
    this.detailUpdateDto.precioUsd = this.form.get('precioUsd').value;
    this.detailUpdateDto.totalUsd = this.form.get('totalUsd').value;

    this.detailUpdateDto.precioLista = this.unitPriceBaseProduction;

    this.detailUpdateDto.solicitarPrecio = this.solicitarPrecio;
    this.detailUpdateDto.obsSolicitud = this.form.get('obsSolicitud').value;
    if (this.appProduct.requiereEstimacion === true) {
      this.detailUpdateDto.obsSolicitud =
        '***SOLICITUD DE ESTIMACION****' + this.form.get('obsSolicitud').value;
    }
    //complementos del DTO
    this.detailUpdateDto.appGeneralQuotesId = this.cotizacion.id;
    this.detailUpdateDto.cotizacion = this.cotizacion.cotizacion;
    this.detailUpdateDto.id = this.item.id;
    this.detailUpdateDto.idEstatus = this.cotizacion.idEstatus;

    this.detailUpdateDto.producto = this.item.producto;
    this.detailUpdateDto.idProducto = this.uiIdProducto;
    this.detailUpdateDto.nombreComercialProducto = this.form.get(
      'nombreComercialProducto',
    ).value;

    this.detailUpdateDto.idUnidad = this.uiIdUnidad;

    this.detailUpdateDto.observaciones = this.form.get('observaciones').value;
    this.detailUpdateDto.diasEntrega = this.form.get('diasEntrega').value;

    this.detailUpdateDto.usuarioConectado =
      this.generalService.GetUsuario().user;

    if (!this.requiereDatosEntrada) {
      this.form.get('medidaBasica').setValue(0);
      this.form.get('medidaOpuesta').setValue(0);
    }

    this.detailUpdateDto.medidaBasica = this.form.get('medidaBasica').value;
    this.detailUpdateDto.medidaOpuesta = this.form.get('medidaOpuesta').value;

    this.detailUpdateDto.valorConvertido = this.form.get('cantidad').value;
    this.detailUpdateDto.cantidadPorUnidadProduccion =
      this.cantidadPorUnidadProduccion;
    this.detailUpdateDto.ordenAnterior = this.form.get('ordenAnterior').value;
    this.detailUpdateDto.calculoId = this.calculoId;
    this.detailUpdateDto.unitPriceBaseProductionMaximo = this.precioMaximo;
    this.detailUpdateDto.forma = this.form.get('forma').value;
    this.detailUpdateDto.salida = this.form.get('salida').value;
    this.detailUpdateDto.presentacion = this.form.get('presentacion').value;

    this.showLoading = true;
    this.mensaje = 'Guardando Cotizacion';

    this.cotizacionesListService
      .UpdateDetalleCotizacion(this.detailUpdateDto)
      .subscribe((result) => {
        if (result.meta.isValid) {
          //recibo cotizacion actualizada desde la api
          this.appGeneralQuotesGetDto = result.data[0];

          this.cotizacionesListService.cotizacion$.next(
            this.appGeneralQuotesGetDto,
          );
          this.showLoading = false;
          this.mensaje = '';

          if (this.appGeneralQuotesGetDto.mensajeSolicitarPrecio.length > 0) {
            this.generalService.presentToastLong(
              'COTIZACIÓN ENVIADA PARA APROBACIÓN POR: ' +
                this.appGeneralQuotesGetDto.mensajeSolicitarPrecio,
              'danger',
            );
          } else {
            this.generalService.presentToast(result.meta.message, 'success');
          }
          //mensaje operacin exitosa

          this.goListDetalleCotizacion();
        } else {
          //mensaje operacion fallida
          this.showLoading = false;
          this.generalService.presentToast(result.meta.message, 'danger');
        }
      });
  }

  onUpdate(eliminarSolicitud: boolean) {
    // 1. Control de errores para la lógica de asignación de datos del formulario
    try {
      //let objetoDetailForUpdate: AppDetailQuotesUpdateDto = new AppDetailQuotesUpdateDto()

      // Asignación de datos y cálculos preliminares
      this.setPrecioMasFlete();

      // Establece cantidad, precio y total con datos de la UI
      this.detailUpdateDto.eliminarSolicitud = eliminarSolicitud;
      this.detailUpdateDto.cantidad = this.form.get('cantidad').value;
      this.detailUpdateDto.condicionPago = this.condicionPagoCodigo;
      this.detailUpdateDto.cantidadSolicitada =
        this.form.get('cantidadSolicitada').value;
      this.detailUpdateDto.precio = this.form.get('precio').value;
      this.detailUpdateDto.total = this.form.get('total').value;
      this.detailUpdateDto.precioUsd = this.form.get('precioUsd').value;
      this.detailUpdateDto.totalUsd = this.form.get('totalUsd').value;

      this.detailUpdateDto.precioLista = this.unitPriceBaseProduction;

      this.detailUpdateDto.solicitarPrecio = this.solicitarPrecio;
      this.detailUpdateDto.obsSolicitud = this.form.get('obsSolicitud').value;
      if (this.appProduct.requiereEstimacion === true) {
        this.detailUpdateDto.obsSolicitud =
          '***SOLICITUD DE ESTIMACION****' +
          this.form.get('obsSolicitud').value;
      }

      // Complementos del DTO
      this.detailUpdateDto.appGeneralQuotesId = this.cotizacion.id;
      this.detailUpdateDto.cotizacion = this.cotizacion.cotizacion;
      this.detailUpdateDto.id = this.item.id;
      this.detailUpdateDto.idEstatus = this.cotizacion.idEstatus;

      this.detailUpdateDto.producto = this.item.producto;
      this.detailUpdateDto.idProducto = this.uiIdProducto;
      this.detailUpdateDto.nombreComercialProducto = this.form.get(
        'nombreComercialProducto',
      ).value;

      this.detailUpdateDto.idUnidad = this.uiIdUnidad;

      this.detailUpdateDto.observaciones = this.form.get('observaciones').value;
      this.detailUpdateDto.diasEntrega = this.form.get('diasEntrega').value;

      this.detailUpdateDto.usuarioConectado =
        this.generalService.GetUsuario().user;

      if (!this.requiereDatosEntrada) {
        this.form.get('medidaBasica').setValue(0);
        this.form.get('medidaOpuesta').setValue(0);
      }

      this.detailUpdateDto.medidaBasica = this.form.get('medidaBasica').value;
      this.detailUpdateDto.medidaOpuesta = this.form.get('medidaOpuesta').value;

      this.detailUpdateDto.valorConvertido = this.form.get('cantidad').value;
      this.detailUpdateDto.cantidadPorUnidadProduccion =
        this.cantidadPorUnidadProduccion;
      this.detailUpdateDto.ordenAnterior = this.form.get('ordenAnterior').value;
      this.detailUpdateDto.calculoId = this.calculoId;
      this.detailUpdateDto.unitPriceBaseProductionMaximo = this.precioMaximo;
      this.detailUpdateDto.forma = this.form.get('forma').value;
      this.detailUpdateDto.salida = this.form.get('salida').value;
      this.detailUpdateDto.presentacion = this.form.get('presentacion').value;

      this.showLoading = true;
      this.mensaje = 'Guardando Cotizacion';
    } catch (error) {
      // Manejo de errores en la asignación de datos (p. ej., si this.form.get('algo') falla)
      console.error(
        'Error al preparar los datos para la actualización:',
        error,
      );
      this.showLoading = false;
      this.mensaje = 'Error interno al procesar los datos.';
      this.generalService.presentToast(
        'Error interno: Falló la preparación de datos.',
        'danger',
      );
      return; // Detener la ejecución si falla la preparación de datos
    }

    // 2. Control de errores para la llamada al servicio
    this.cotizacionesListService
      .UpdateDetalleCotizacion(this.detailUpdateDto)
      .subscribe({
        next: (result) => {
          if (result.meta.isValid) {
            // Recibo cotización actualizada desde la api
            this.appGeneralQuotesGetDto = result.data[0];

            this.cotizacionesListService.cotizacion$.next(
              this.appGeneralQuotesGetDto,
            );
            this.showLoading = false;
            this.mensaje = '';

            // Mensaje de éxito con manejo especial para la solicitud de precio
            if (
              this.appGeneralQuotesGetDto.mensajeSolicitarPrecio &&
              this.appGeneralQuotesGetDto.mensajeSolicitarPrecio.length > 0
            ) {
              this.generalService.presentToastLong(
                'COTIZACIÓN ENVIADA PARA APROBACIÓN POR: ' +
                  this.appGeneralQuotesGetDto.mensajeSolicitarPrecio,
                'danger', // Usar 'danger' o un color de alerta para destacar la necesidad de aprobación
              );
            } else {
              this.generalService.presentToast(result.meta.message, 'success');
            }

            this.goListDetalleCotizacion();
          } else {
            // Mensaje operación fallida (errores de validación o negocio de la API)
            this.showLoading = false;
            this.generalService.presentToast(result.meta.message, 'danger');
          }
        },
        error: (err) => {
          // Manejo de errores de red o del servidor (HTTP/conexión)
          console.error(
            'Error en la llamada al servicio UpdateDetalleCotizacion:',
            err,
          );
          this.showLoading = false;
          this.mensaje = '';
          // Proporcionar un mensaje de error más genérico si el error del servidor no es amigable
          let errorMessage =
            'Error al actualizar el detalle de la cotización. Intente de nuevo.';
          if (err && err.message) {
            errorMessage = `Error de conexión/servidor: ${err.message}`;
          }
          this.generalService.presentToast(errorMessage, 'danger');
        },
        complete: () => {
          // Opcional: Lógica a ejecutar cuando el observable se completa
          console.log('Actualización de detalle de cotización completada.');
        },
      });
  }

  onSave(eliminarSolicitud: boolean): void {
    if (this.form.get('diasEntrega').value === 0) {
      this.generalService.presentToast('Indique Los dias de entrega', 'danger');
      return;
    }

    if (
      this.appProduct.tipoCalculo === 1 &&
      (this.form.get('medidaBasica').value <= 0 ||
        this.form.get('medidaOpuesta').value <= 0)
    ) {
      this.generalService.presentToast(
        'Indique Medida Basica y Medida Opuesta',
        'danger',
      );
      return;
    }
    if (
      this.appProduct.tipoCalculo === 4 &&
      (this.form.get('medidaBasica').value <= 0 ||
        this.form.get('medidaOpuesta').value <= 0)
    ) {
      this.generalService.presentToast(
        'Indique Medida Basica y Medida Opuesta',
        'danger',
      );
      return;
    }
    if (
      this.requiereAprobacionPrecio === true &&
      this.form.get('obsSolicitud').value === ''
    ) {
      this.generalService.presentToast(
        'Indique observacion de Solictud de precios y presione enviar solicitud',
        'danger',
      );
      return;
    }
    if (
      this.appProduct &&
      this.appProduct.appSubCategoryId === 9 &&
      this.form.get('salida').value.length <= 0
    ) {
      this.generalService.presentToast(
        'Debe indicar la salida de la Etiqueta',
        'danger',
      );
      return;
    }
    if (
      this.appProduct &&
      this.appProduct.appSubCategoryId === 9 &&
      this.form.get('forma').value.length <= 0
    ) {
      this.generalService.presentToast(
        'Debe indicar la  Forma de la Etiqueta (Regular,Irregular)',
        'danger',
      );
      return;
    }
    if (
      this.appProduct &&
      this.appProduct.appSubCategoryId === 9 &&
      this.form.get('presentacion').value.length <= 5
    ) {
      this.generalService.presentToast(
        'Debe indicar la Presentacion de la Etiqueta(Minimo 5 Digitos)',
        'danger',
      );
      return;
    }
    const precio = this.item.statusAprobacionDto.valorVentaAprobarUsd;
    if (
      this.item.statusAprobacionDto.valorVentaAprobarUsd > 0 &&
      this.form.get('precioUsd').value < precio
    ) {
      this.generalService.presentToast(
        'Precio es menor a el precio Aprobado',
        'danger',
      );
      return;
    }

    if (
      this.requiereAprobacionPrecio === true &&
      this.form.get('obsSolicitud').value === ''
    ) {
      this.generalService.presentToast(
        'Indique observacion de Solictud de precios y presione enviar solicitud',
        'danger',
      );
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
        'Indique observacion de Solictud de precios y presione enviar solicitud',
        'danger',
      );
      return;
    } else {
      this.solicitarPrecio = true;
      this.onSave(true);
    }
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
    this.router.navigate(['/menu/list-detalle-cotizacion'], {});
  }

  setRequiereAprobacioPrecioCantidad() {
    this.requiereAprobacionPrecio = false;
    this.colorToolbar = 'primary';
    this.solicitarPrecio = false;
    this.mensajeBotonSolicitarPrecio = '';
    if (this.appProduct && this.operacion !== 1) {
      if (
        this.newPrecioMasFlete > this.variables.precioUsd ||
        this.appProduct.requiereEstimacion === true ||
        this.porDebajoDeCantidadMinima === true
      ) {
        this.requiereAprobacionPrecio = true;
        this.colorToolbar = 'danger';
        this.solicitarPrecio = true;
        this.mensajeBotonSolicitarPrecio =
          ' Enviar Aprobación Por Precio y Salvar';
        if (this.appProduct.requiereEstimacion === true) {
          this.mensajeBotonSolicitarPrecio =
            ' Enviar Aprobación Por Estimación(' +
            this.appProduct.code +
            ')' +
            '  y Salvar';
        }
      }
    }
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

  setPrecioMasFlete() {
    const precioString = localStorage.getItem('precio-mas-flete');

    // 1. Validar si el valor existe en localStorage
    if (precioString === null || precioString === 'undefined') {
      // 'undefined' string can sometimes appear if not set correctly
      console.warn(
        'Advertencia: "precio-mas-flete" no encontrado en localStorage.',
      );
      // Aquí puedes decidir cómo manejar la ausencia del valor:
      // a) Asignar valores por defecto a tus propiedades:
      this.newPrecioMasFlete = 0;
      this.flete = 0;
      this.unitPriceBaseProduction = 0;
      this.calculoId = 0; // O null, dependiendo de tu lógica
      this.precioMaximo = 0;
      this.porDebajoDeCantidadMinima = false;
      // b) O, podrías simplemente retornar la función para evitar ejecutar el resto del código
      // return;
    }
    // 2. Si el valor existe, proceder a parsearlo
    const precio: PrecioDto = JSON.parse(precioString);
    console.log('precio en setPrecioMasFlete', precio);
    // Asegurarse de que el objeto 'precio' y sus propiedades no sean null/undefined
    this.newPrecioMasFlete = precio.precioMasFlete ?? 0;
    this.newPrecioMasFlete = +this.newPrecioMasFlete.toFixed(2);
    this.flete = precio.flete ?? 0;
    this.unitPriceBaseProduction = precio.unitPriceBaseProduction ?? 0;
    this.calculoId = precio.calculoId ?? 0; // O null, si es un tipo numérico que puede ser nulo
    this.precioMaximo = precio.precioMaximo ?? 0;
    this.porDebajoDeCantidadMinima = precio.porDebajoDeCantidadMinima ?? false;

    // El resto de tu lógica que depende de 'this.item' se ejecuta después de
    // que las variables de precio se hayan inicializado (ya sea desde localStorage o con valores por defecto)

    if (this.item.statusAprobacionDto.aprobado && this.item.estimada) {
      this.unitPriceBaseProduction =
        this.item.statusAprobacionDto.valorVentaAprobarUsd;
      this.newPrecioMasFlete =
        this.item.statusAprobacionDto.valorVentaAprobarUsd;
      this.newPrecioMasFlete = +this.newPrecioMasFlete.toFixed(2);
    } else {
      if (
        (this.item.appProductsGetDto &&
          this.item.appProductsGetDto.requiereEstimacion) ||
        this.porDebajoDeCantidadMinima
      ) {
        this.newPrecioMasFlete = 0;
        this.flete = 0;
        this.unitPriceBaseProduction = 0;
        this.calculoId = precio.calculoId ?? 0;
        this.precioMaximo = 0;
      }
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
      this.newPrecioMasFlete = +this.newPrecioMasFlete.toFixed(2);
    }
  }

  setPrecioMasFleteOriginal() {
    const precio: PrecioDto = JSON.parse(
      localStorage.getItem('precio-mas-flete'),
    );

    this.newPrecioMasFlete = precio.precioMasFlete;
    this.flete = precio.flete;
    this.unitPriceBaseProduction = precio.unitPriceBaseProduction;

    this.calculoId = precio.calculoId;
    if (this.item.idEstatus >= 5) {
      this.unitPriceBaseProduction = this.item?.unitPriceBaseProduction ?? 0; // Valor por defecto 0 si es null/undefined
      this.flete = this.item?.flete ?? 0; // Valor por defecto 0 si es null/undefined
      this.newPrecioMasFlete = this.unitPriceBaseProduction + this.flete || 0; // Evita NaN
      this.newPrecioMasFlete = +this.newPrecioMasFlete.toFixed(2); // Redondea a 2 decimales
    }
    if (
      this.item.statusAprobacionDto.aprobado &&
      this.item.statusAprobacionDto.flagCerrado
    ) {
      this.unitPriceBaseProduction =
        this.item.statusAprobacionDto.valorVentaAprobarUsd;
      this.newPrecioMasFlete =
        this.item.statusAprobacionDto.valorVentaAprobarUsd;
    }
  }
  setColorToolbar() {
    this.concesionString = '';
    this.variables.precioUsd = this.form.get('precioUsd').value;
    this.concesion = 0;
    this.setPrecioMasFlete();
    this.requiereAprobacionPrecio = false;
    this.colorToolbar = 'primary';
    this.solicitarPrecio = false;
    this.mensajeBotonSolicitarPrecio = '';

    const lista = Number(this.newPrecioMasFlete);
    if (lista !== 0) {
      this.concesion = (lista - this.variables.precioUsd) / lista;

      this.concesion = this.concesion * 100;
      this.concesionString = '';
      if (this.concesion < 0) {
        this.concesionString =
          '+' + Number(this.concesion.toFixed(2)) * -1 + '% de sobre margen';
      }
      if (this.concesion > 0) {
        this.concesionString =
          '-' + Number(this.concesion.toFixed(2)) + '% de descuento';
      }
      if (this.concesion === 0) {
        this.concesionString = '0% de descuento';
      }
    }

    let cantidad = this.form.get('cantidad').value;
    if (this.appProduct.tipoCalculo === 4) {
      cantidad = this.form.get('cantidadConvertidaAlternativa').value;
    }

    if (this.operacion === 1) {
      //editar

      if (this.item.idEstatus >= 5) {
        this.requiereAprobacionPrecio = false;
        this.colorToolbar = 'primary';
        this.solicitarPrecio = false;
        this.mensajeBotonSolicitarPrecio = '';
        return;
      }

      if (
        this.item.statusAprobacionDto.aprobado &&
        this.item.statusAprobacionDto.flagCerrado
      ) {
        this.requiereAprobacionPrecio = false;
        this.colorToolbar = 'success';
        this.solicitarPrecio = false;
        this.mensajeBotonSolicitarPrecio = '';
      } else {
        if (
          this.newPrecioMasFlete > this.variables.precioUsd ||
          this.appProduct.requiereEstimacion === true ||
          this.porDebajoDeCantidadMinima === true
        ) {
          this.requiereAprobacionPrecio = true;
          this.colorToolbar = 'danger';
          this.solicitarPrecio = true;
          this.mensajeBotonSolicitarPrecio =
            'Enviar Aprobación Por Precio y Salvar';
        } else {
          this.requiereAprobacionPrecio = false;
          this.colorToolbar = 'primary';
          this.solicitarPrecio = false;
          this.mensajeBotonSolicitarPrecio = '';
        }
      }
    } else {
      //nuevo
      if (this.appProduct) {
        cantidad = this.form.get('cantidad').value;
        if (this.appProduct.tipoCalculo === 4) {
          cantidad = this.form.get('cantidadConvertidaAlternativa').value;
        }
        if (
          this.newPrecioMasFlete > this.variables.precioUsd ||
          this.appProduct.requiereEstimacion === true ||
          this.porDebajoDeCantidadMinima === true
        ) {
          this.requiereAprobacionPrecio = true;
          this.colorToolbar = 'danger';
          this.solicitarPrecio = true;
          this.mensajeBotonSolicitarPrecio =
            ' Enviar Aprobación Por Precio y Salvar';
          if (this.appProduct.requiereEstimacion === true) {
            this.mensajeBotonSolicitarPrecio =
              ' Enviar Aprobación Por Estimación(' +
              this.appProduct.code +
              ')' +
              '  y Salvar';
          }
        } else {
          this.requiereAprobacionPrecio = false;
          this.colorToolbar = 'primary';
          this.solicitarPrecio = false;
          this.mensajeBotonSolicitarPrecio = '';
        }
        if (this.isBs === true) {
          this.requiereAprobacionPrecio = true;
          this.colorToolbar = 'danger';
          this.solicitarPrecio = true;
          this.mensajeBotonSolicitarPrecio =
            ' Enviar Aprobación Por Precio y Salvar';
        }
      }
    }
  }

  //Buscador de productos OK
  async onBuscarProductoGeneral() {
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
      this.uiImageLink = data.link;
      this.uiNombreProductoInCard =
        this.appProduct.description1 + ' ' + this.appProduct.description2;
      this.btnUmDisabled = false;
      this.decripcionProductionUnit = data.decripcionProductionUnit;
      //para la calculadora
      this.dtoCalculadora.appProductId = data.id;
      this.dtoCalculadora.appUnitIdUntil = data.idUnidadMedida;

      this.appPriceDto = data.appPriceDto;
      this.requiereDatosEntrada = data.requiereDatosEntrada;

      if (this.appProduct != null && !this.requiereDatosEntrada) {
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
      let cantidadBuscarPrecio = 0;
      if (this.form.get('cantidad').value > 0) {
        cantidadBuscarPrecio = this.form.get('cantidad').value;
      } else {
        cantidadBuscarPrecio = 1;
      }

      const precio = this.buscarPrecioPorRango(
        this.appPriceDto,
        cantidadBuscarPrecio,
      );

      this.item.unitPriceBaseProduction = precio;
      this.unitPriceBaseProduction = precio;

      if (this.cotizacion.porcFlete > 0) {
        this.flete =
          (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;
      }

      //this.precioMasFlete = this.unitPriceBaseProduction + this.flete;
      //this.precioMasFlete = this.precioMasFlete.toFixed(2);
    }
  }

  //Buscador de productos OK
  async onBuscarProducto() {
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
      this.uiImageLink = data.link;
      this.uiNombreProductoInCard =
        this.appProduct.description1 + ' ' + this.appProduct.description2;
      this.btnUmDisabled = false;
      this.decripcionProductionUnit = data.decripcionProductionUnit;
      //para la calculadora
      this.dtoCalculadora.appProductId = data.id;
      this.dtoCalculadora.appUnitIdUntil = data.idUnidadMedida;

      this.appPriceDto = data.appPriceDto;
      this.requiereDatosEntrada = data.requiereDatosEntrada;

      if (this.appProduct != null && !this.requiereDatosEntrada) {
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

      //Verifico si el id de producto seleccionado ya existe en el array de detalle cotizaciones
      //caso +, asigno dicho elemento a this.item y es todo
      if (
        !this.requiereDatosEntrada &&
        this.appPriceDto != null &&
        this.appPriceDto.length > 0
      ) {
        const precio = this.buscarPrecioPorRango(
          this.appPriceDto,
          this.form.get('cantidad').value,
        );

        this.item.unitPriceBaseProduction = precio;
        this.unitPriceBaseProduction = precio;
      }

      if (this.cotizacion.porcFlete > 0) {
        this.flete =
          (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;
      }

      this.newPrecioMasFlete = this.unitPriceBaseProduction + this.flete;

      //'onBuscarProducto');
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
    let result: number;

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
      result = cantidad;
      return result;
    } else {
      return 0;
    }
  }

  async recalculoPrecioPorProductoCantidadLargoAncho() {
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

    this.buscandoPrecio = true;
    this.mensaje = 'Buscando precio........';
    await this.productoService.getPrice(filter).subscribe((resp) => {
      this.buscandoPrecio = false;
      this.mensaje = '';

      var precioDto: PrecioDto = {
        unitPriceBaseProduction: resp.data.precio,
        precioMasFlete: resp.data.precioMasFlete,
        calculoId: resp.data.calculoId,
        flete: resp.data.flete,
        porcFlete: resp.data.porcFlete,
        precioMaximo: resp.data.precioMaximo,
        precioMaximoMasFlete: resp.data.precioMaximoMasFlete,
        porDebajoDeCantidadMinima: resp.data.porDebajoDeCantidadMinima,
      };
      localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

      this.calculoId = resp.data.calculoId;

      this.unitPriceBaseProduction = resp.data.precio;
      this.item.unitPriceBaseProduction = resp.data.precio;
      this.precioMaximo = resp.data.precioMaximo;
      this.newPrecioMasFlete = resp.data.precioMasFlete;
      this.porDebajoDeCantidadMinima = resp.data.porDebajoDeCantidadMinima;

      if (
        this.appProduct.requiereEstimacion === true ||
        resp.data.porDebajoDeCantidadMinima === true
      ) {
        this.unitPriceBaseProduction = 0.00000000001;
        this.precioMaximo = 0;
        this.newPrecioMasFlete = 0;
        this.calculoId = 0;
        this.uiUnitPriceConverted = 0;
        this.precioPorUnidad = 0;
        this.cantidadPorUnidad = resp.data.cantidadPorUnidad;

        if (this.item.statusAprobacionDto.precioEstimacion > 0) {
          this.unitPriceBaseProduction =
            this.item.statusAprobacionDto.precioEstimacion;
          this.precioMaximo = this.item.statusAprobacionDto.precioEstimacion;
        }
      } else {
        this.flete = resp.data.flete;
        this.newPrecioMasFlete = resp.data.precioMasFlete;

        this.uiUnitPriceConverted =
          this.newPrecioMasFlete / this.form.get('cantidad').value;
        //this.uiUnitPriceConverted = this.precioMasFlete /  this.cantidadPorUnidadProduccion;
        this.precioPorUnidad = resp.data.precioPorUnidad;
        this.cantidadPorUnidad = resp.data.cantidadPorUnidad;
      }
      this.form.get('cantidad').setValue(resp.data.cantidadConvertida);
      if (resp.data.cantidadConvertidaAlternativa) {
        this.form
          .get('cantidadConvertidaAlternativa')
          .setValue(resp.data.cantidadConvertidaAlternativa);
      }
      this.item.cantidad = this.form.get('cantidad').value;

      this.form.get('precio').setValue(this.newPrecioMasFlete);
      this.form
        .get('total')
        .setValue(
          this.form.get('precio').value * this.form.get('cantidad').value,
        );

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
      this.setColorToolbar();
      this.mensaje = '';
    });
  }
  recalculoRequiereEntradaLargoAncho() {
    this.mensaje =
      'Buscando precio em recalculoRequiereEntradaLargoAncho........';
    if (this.appProduct.tipoCalculo === 1) {
      const calculoConversion = this.calculaConversion(
        this.form.get('cantidadSolicitada').value,
        this.form.get('medidaBasica').value,
        this.form.get('medidaOpuesta').value,
      );

      this.cantidadPorUnidadProduccion = calculoConversion.resulCantidad;
      this.item.valorConvertido = calculoConversion.area;
    }
    let porrcentajeAprovechamiento = 0;
    porrcentajeAprovechamiento =
      this.cantidadPorUnidadProduccion * this.item.valorConvertido;
    //cantidad = (this.form.get('cantidadSolicitada').value / this.cantidadPorUnidadProduccion) / porrcentajeAprovechamiento;

    this.form
      .get('cantidad')
      .setValue(
        this.form.get('cantidadSolicitada').value /
          this.cantidadPorUnidadProduccion,
      );

    /* if (this.dtoCalculadora.appUnitIdUntil == this.dtoCalculadora.appUnitIdSince) {
            this.form.get('cantidad').setValue(this.form.get('cantidadSolicitada').value);
        } */

    this.item.cantidad = this.form.get('cantidad').value;

    const align = 'left';
    this.optionsMask = {
      prefix: '',
      thousands: '.',
      decimal: ',',
      align,
      precision: this.decimalCount(this.form.get('cantidad').value),
    };
    const longitud = this.decimalCount(this.form.get('cantidad').value);
    this.longituDecimal = longitud.toString();

    if (
      this.requiereDatosEntrada &&
      this.appPriceDto != null &&
      this.appPriceDto.length > 0
    ) {
      const precio = this.buscarPrecioPorRango(
        this.appPriceDto,
        this.form.get('cantidad').value,
      );
      this.item.unitPriceBaseProduction = precio;
      this.unitPriceBaseProduction = precio;
    }
    if (this.appProduct.requiereEstimacion === true) {
      this.unitPriceBaseProduction = 0;
      this.precioMaximo = 0;
      if (this.item.statusAprobacionDto.precioEstimacion > 0) {
        this.unitPriceBaseProduction =
          this.item.statusAprobacionDto.precioEstimacion;
        this.precioMaximo = this.item.statusAprobacionDto.precioEstimacion;
      }
    }
    if (this.cotizacion.porcFlete > 0) {
      this.flete =
        (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;
    }

    var precioDto: PrecioDto = {
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      precioMasFlete: this.unitPriceBaseProduction + this.flete,
      calculoId: 0,
      flete: this.flete,
      porcFlete: this.cotizacion.porcFlete,
      precioMaximo: this.precioMaximo,
      precioMaximoMasFlete: this.precioMaximo + this.flete,
      porDebajoDeCantidadMinima: false,
    };
    localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

    this.uiUnitPriceConverted =
      this.newPrecioMasFlete / this.cantidadPorUnidadProduccion;

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
    this.mensaje = '';
    //this.setColorToolbar();
  }
  recalculoPorRango() {
    this.mensaje = 'Buscando precio por rango ***........ Linea 2164';
    console.log(this.mensaje);
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

    const precio = this.buscarPrecioPorRango(
      this.appPriceDto,
      this.form.get('cantidad').value,
    );
    this.precioMaximo = this.buscarPrecioMaximoPorRango(
      this.appPriceDto,
      this.form.get('cantidad').value,
    );

    this.item.unitPriceBaseProduction =
      precio + (precio * this.condicionPagoDto.pocGapAplicarPrecio) / 100;

    this.unitPriceBaseProduction =
      precio + (precio * this.condicionPagoDto.pocGapAplicarPrecio) / 100;

    this.precioMaximo =
      this.precioMaximo +
      (this.precioMaximo * this.condicionPagoDto.pocGapAplicarPrecio) / 100;

    if (this.appProduct.requiereEstimacion === true) {
      this.unitPriceBaseProduction = 0;
      this.precioMaximo = 0;
      if (this.item.statusAprobacionDto.precioEstimacion > 0) {
        this.unitPriceBaseProduction =
          this.item.statusAprobacionDto.precioEstimacion;
        this.precioMaximo = this.item.statusAprobacionDto.precioEstimacion;
      }
    }

    let porcFlete = 0;
    porcFlete = this.cotizacion.porcFlete;
    if (this.appProduct.porcFlete > 0) {
      porcFlete = this.appProduct.porcFlete;
    }
    console.log('appProduct', this.appProduct);
    console.log('porcFlete cotizacion', this.cotizacion.porcFlete);
    console.log('porcFlete Producto', this.appProduct.porcFlete);
    console.log('porcFlete', porcFlete);
    this.flete = (this.unitPriceBaseProduction * porcFlete) / 100;

    this.newPrecioMasFlete = this.unitPriceBaseProduction + this.flete;
    var precioDto: PrecioDto = {
      unitPriceBaseProduction: this.unitPriceBaseProduction,
      precioMasFlete: this.newPrecioMasFlete,
      calculoId: 0,
      flete: this.flete,
      porcFlete: porcFlete,
      precioMaximo: this.precioMaximo,
      precioMaximoMasFlete: this.precioMaximo + this.flete,
      porDebajoDeCantidadMinima: false,
    };
    localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

    this.uiUnitPriceConverted =
      this.newPrecioMasFlete / this.cantidadPorUnidadProduccion;

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
    this.mensaje = '';
    this.setColorToolbar();
  }

  async recalculoPrecioPorProductoCantidad() {
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
    };

    this.buscandoPrecio = true;
    this.mensaje = 'Buscando precio ........';

    await this.productoService.getPrice(filter).subscribe((resp) => {
      this.buscandoPrecio = false;
      this.mensaje = '';

      this.calculoId = resp.data.calculoId;
      const precio = resp.data.precio;
      this.unitPriceBaseProduction = precio;
      this.precioMaximo = resp.data.precioMaximo;
      this.item.unitPriceBaseProduction = precio;
      this.flete = resp.data.flete;
      let calculoIdResponse = 0;
      if (resp.data.calculoId) {
        calculoIdResponse = resp.data.calculoId;
      }

      var precioDto: PrecioDto = {
        unitPriceBaseProduction: resp.data.precio,
        precioMasFlete: resp.data.precioMasFlete,
        calculoId: calculoIdResponse,
        flete: resp.data.flete,
        porcFlete: this.cotizacion.porcFlete,
        precioMaximo: resp.data.precioMaximo,
        precioMaximoMasFlete: resp.data.precioMaximoMasFlete,
        porDebajoDeCantidadMinima: resp.data.porDebajoDeCantidadMinima,
      };
      localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

      if (
        this.appProduct.requiereEstimacion === true ||
        resp.data.porDebajoDeCantidadMinima
      ) {
        this.unitPriceBaseProduction = 0;
        this.precioMaximo = 0;
        this.newPrecioMasFlete = 0;
        this.calculoId = 0;
        this.uiUnitPriceConverted = 0;
        if (this.item.statusAprobacionDto.precioEstimacion > 0) {
          this.unitPriceBaseProduction =
            this.item.statusAprobacionDto.precioEstimacion;
          this.precioMaximo = this.item.statusAprobacionDto.precioEstimacion;
          this.flete =
            (this.unitPriceBaseProduction * this.cotizacion.porcFlete) / 100;

          var precioDto: PrecioDto = {
            unitPriceBaseProduction: resp.data.precio,
            precioMasFlete: resp.data.precioMasFlete,
            calculoId: resp.data.calculoId,
            flete: resp.data.flete,
            porcFlete: this.cotizacion.porcFlete,
            precioMaximo: resp.data.precioMaximo,
            precioMaximoMasFlete: resp.data.precioMaximoMasFlete,
            porDebajoDeCantidadMinima: resp.data.porDebajoDeCantidadMinima,
          };
          localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));
        }
      }

      if (resp.data.cantidadConvertida > 0) {
        this.form.get('cantidad').setValue(resp.data.cantidadConvertida);
        this.item.cantidad = this.form.get('cantidad').value;
      }
      if (
        resp.data.cantidadConvertidaAlternativa &&
        resp.data.cantidadConvertidaAlternativa > 0
      ) {
        this.form
          .get('cantidadConvertidaAlternativa')
          .setValue(resp.data.cantidadConvertidaAlternativa);
      } else {
        this.form
          .get('cantidadConvertidaAlternativa')
          .setValue(resp.data.cantidadConvertida);
      }

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

      this.setColorToolbar();
    });
  }

  async recalculoPrecioPorProductoCantidadRollo() {
    this.form.get('cantidad').setValue(0);

    const filter = {
      idMunicipio: this.cotizacion.idMunicipio,
      appProuctId: this.appProduct.id,
      cantidad: this.form.get('cantidadSolicitada').value,
      appDetailQuotesId: this.item.id,
      unidad: this.uiIdUnidad,
      condicionDePago: this.form.get('condicionPago').value,
    };

    this.buscandoPrecio = true;
    this.mensaje = 'Buscando precio por rollo........';
    await this.productoService.getPrice(filter).subscribe((resp) => {
      this.buscandoPrecio = false;
      this.mensaje = '';

      this.calculoId = resp.data.calculoId;
      const precio = resp.data.precio;
      this.unitPriceBaseProduction = precio;
      this.precioMaximo = resp.data.precioMaximo;
      this.item.unitPriceBaseProduction = precio;
      this.flete = resp.data.flete;

      var precioDto: PrecioDto = {
        unitPriceBaseProduction: resp.data.precio,
        precioMasFlete: resp.data.precioMasFlete,
        calculoId: resp.data.calculoId,
        flete: resp.data.flete,
        porcFlete: this.cotizacion.porcFlete,
        precioMaximo: resp.data.precioMaximo,
        precioMaximoMasFlete: resp.data.precioMaximoMasFlete,
        porDebajoDeCantidadMinima: resp.data.porDebajoDeCantidadMinima,
      };
      localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

      this.porDebajoDeCantidadMinima = resp.data.porDebajoDeCantidadMinima;
      if (
        this.appProduct.requiereEstimacion === true ||
        resp.data.porDebajoDeCantidadMinima === true
      ) {
        this.unitPriceBaseProduction = 0;
        this.precioMaximo = 0;
        this.flete = 0;

        var precioDto: PrecioDto = {
          unitPriceBaseProduction: 0,
          precioMasFlete: 0,
          calculoId: resp.data.calculoId,
          flete: 0,
          porcFlete: 0,
          precioMaximo: 0,
          precioMaximoMasFlete: 0,
          porDebajoDeCantidadMinima: this.porDebajoDeCantidadMinima,
        };
        localStorage.setItem('precio-mas-flete', JSON.stringify(precioDto));

        this.calculoId = resp.data.calculoId;
        this.uiUnitPriceConverted = 0;
        this.precioPorUnidad = 0;
        if (this.item.statusAprobacionDto.precioEstimacion > 0) {
          this.unitPriceBaseProduction =
            this.item.statusAprobacionDto.precioEstimacion;
          this.precioMaximo = this.item.statusAprobacionDto.precioEstimacion;
        }
      }

      this.form.get('cantidad').setValue(resp.data.cantidadConvertida);
      if (
        resp.data.cantidadConvertidaAlternativa &&
        resp.data.cantidadConvertidaAlternativa > 0
      ) {
        this.form
          .get('cantidadConvertidaAlternativa')
          .setValue(resp.data.cantidadConvertidaAlternativa);
      }
      this.item.cantidad = this.form.get('cantidad').value;

      this.form.get('precio').setValue(this.newPrecioMasFlete);
      this.form
        .get('total')
        .setValue(
          this.form.get('precio').value * this.form.get('cantidad').value,
        );
      this.uiUnitPriceConverted =
        this.newPrecioMasFlete / this.form.get('cantidad').value;
      //this.uiUnitPriceConverted = this.precioMasFlete /  this.cantidadPorUnidadProduccion;
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
      this.mensaje = '';
      this.setColorToolbar();
    });
  }

  calculaTotalVenta(precioRecibido: number) {
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
        .setValue(precioRecibido * this.form.get('cantidad').value);
    }
    this.isDolar = true;
    if (this.isDolar) {
      //COTIZACION EN DOLARES

      this.form
        .get('totalUsd')
        .setValue(precioRecibido * this.form.get('cantidad').value);
      if (this.tasa > 0) {
        if (this.ultimoPrecioUsd !== precioRecibido) {
          this.ultimoPrecioUsd = precioRecibido;
          this.form.get('precio').setValue(precioRecibido * this.tasa);
        }
      }

      this.form
        .get('total')
        .setValue(precioRecibido * this.tasa * this.form.get('cantidad').value);
      this.form
        .get('totalUsd')
        .setValue(precioRecibido * this.form.get('cantidad').value);
    }
  }
  //------------------------------------
  async onRecalcular(origenLlamada: string) {
    if (this.appProduct != null) {
      switch (this.appProduct.tipoCalculo) {
        //RequiereEntradaLargoAncho=1
        case 1:
          this.form.get('cantidad').setValue(0);
          this.form.get('cantidadConvertidaAlternativa').setValue(0);
          if (
            this.form.get('medidaBasica').value > 0 &&
            this.form.get('medidaOpuesta').value > 0 &&
            this.form.get('cantidadSolicitada').value > 0
          ) {
            this.recalculoRequiereEntradaLargoAncho();
            this.setColorToolbar();
          }

          break;
        //PrecioPorProducto

        case 2:
          this.form.get('cantidad').setValue(0);
          this.form.get('cantidadConvertidaAlternativa').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPorRango();
          }

          break;

        //PrecioPorProductoCantidad
        case 3:
          this.form.get('cantidad').setValue(0);
          this.form.get('cantidadConvertidaAlternativa').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPrecioPorProductoCantidad();
            this.setColorToolbar();
          }

          break;
        case 4:
          this.form.get('cantidad').setValue(0);
          this.form.get('cantidadConvertidaAlternativa').setValue(0);

          if (
            this.form.get('medidaBasica').value > 0 &&
            this.form.get('medidaOpuesta').value > 0 &&
            this.form.get('cantidadSolicitada').value > 0
          ) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
            this.setColorToolbar();
          }

          break;
        case 5:
          this.form.get('cantidad').setValue(0);
          this.form.get('cantidadConvertidaAlternativa').setValue(0);
          if (this.form.get('cantidadSolicitada').value > 0) {
            this.recalculoPrecioPorProductoCantidadRollo();
          }

          break;
        //ETTIQUETAS PRIME
        case 6:
          this.form.get('cantidad').setValue(0);
          this.form.get('cantidadConvertidaAlternativa').setValue(0);
          if (
            this.form.get('medidaBasica').value > 0 &&
            this.form.get('medidaOpuesta').value > 0 &&
            this.form.get('cantidadSolicitada').value > 0
          ) {
            this.recalculoPrecioPorProductoCantidadLargoAncho();
            this.setColorToolbar();
          }

          break;
      }
    }
  }

  buscarPrecioPorRango(_appPriceDto: AppPriceDto[], cantidad: number): number {
    let result: number;

    if (_appPriceDto.length == 0) {
      _appPriceDto = this.item.appProductsGetDto.appPriceDto;
    }

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
      result = _appPriceDto[0].precio;
    }

    return result;
  }
  async buscaPrecioProductoCantidad(appProductId: number, cantidad: number) {
    let result: number;

    //let filter:AppRecipesByAppDetailQuotesQueryFilter;
    const filter = {
      appProuctId: appProductId,
      cantidad,
    };

    await this.productoService
      .buscaProductoCantidad(filter)
      .subscribe((resp) => {
        result = 1;
        return result;
      });
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
    const result = conversion.getCantidadAlternativa();

    return result;
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
    let result = 0;

    result = +numero / Math.pow(10, +precision);

    return result;
  }

  onBuscarCaracteristicas() {
    this.router.navigate(['/menu/especificaciones'], {
      state: { cotizacion: this.cotizacion },
    }); //1 edit
  }

  onBuscarordenAnterior() {
    this.router.navigate(['/menu/repeticiones'], {
      state: { cotizacion: this.cotizacion },
    }); //1 edit
  }
}
