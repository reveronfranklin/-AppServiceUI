import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/Operators';
import { BuscadorProductosComponent } from 'src/app/components/buscador-productos/buscador-productos.component';
import { AppOrdenProductoRepeticionFilterDto } from 'src/app/interfaces/app-orden-producto-repeticion-filter';
import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { AppGeneralQuotesGetDto } from 'src/app/models/app-general-quotes-get-dto';
import { AppOrdenProductoRepeticionGetDto,
         AppRepeticionClienteBasica,
        AppRepeticionClienteNombreForma,
        AppRepeticionClienteOpuesta,
        AppRepeticionClientePapelCuartaParte,
        AppRepeticionClientePapelPrimeraParte,
        AppRepeticionClientePapelQuintaParte,
        AppRepeticionClientePapelSegundaParte,
        AppRepeticionClientePapelTerceraParte,
        AppRepeticionClientePartes,
        AppRepeticionClienteProducto,
        AppRepeticionClienteTintas, ListaRepeticiones } from 'src/app/models/repeticiones';
import { CotizacionesListService } from 'src/app/services/cotizaciones/cotizaciones-list.service';
import { GeneralService } from 'src/app/services/general.service';
import { RepeticionesService } from 'src/app/services/repeticiones.service';
import { AppProductsGetDto } from '../../../models/app-products-get-dto';
import { IUsuario } from 'src/app/interfaces/iusuario';

@Component({
  selector: 'app-repeticiones',
  templateUrl: './repeticiones.page.html',
  styleUrls: ['./repeticiones.page.scss'],
})
export class RepeticionesPage implements OnDestroy, OnInit {
  public cotizacion: AppGeneralQuotesGetDto;
  public repeticionesFilter: AppOrdenProductoRepeticionFilterDto;
  public cargando = false;
  public appOrdenProductoRepeticionGetDto: AppOrdenProductoRepeticionGetDto[] = [];
  public appOrdenProductoRepeticionGetDtoBK: AppOrdenProductoRepeticionGetDto[] = [];
  public appOrdenProductoRepeticionGetDtoOriginal: AppOrdenProductoRepeticionGetDto[] = [];
  public showLoading: boolean;
  public orden: string;
  public usuario: IUsuario;

  public appOrdenProductoRepeticionSelected: AppOrdenProductoRepeticionGetDto;

  public productoSeleccionado = new  AppProductsGetDto();
  listaRepeticiones: ListaRepeticiones;

  productos: AppRepeticionClienteProducto[] = [];
  producto: AppRepeticionClienteProducto;

  nombresForma: AppRepeticionClienteNombreForma[] = [];
  nombreForma: AppRepeticionClienteNombreForma;

  medidasBasica: AppRepeticionClienteBasica[] = [];
  medidaBasica: AppRepeticionClienteBasica;

  medidasOpuesta: AppRepeticionClienteOpuesta[] = [];
  medidaOpuesta: AppRepeticionClienteOpuesta;

  cantidadPartes: AppRepeticionClientePartes[] = [];
  cantidadParte: AppRepeticionClientePartes;

  cantidadTintas: AppRepeticionClienteTintas[] = [];
  cantidadTinta: AppRepeticionClienteTintas;

  papelesPrimeraParte: AppRepeticionClientePapelPrimeraParte[] = [];
  papelPrimeraParte: AppRepeticionClientePapelPrimeraParte;

  papelesSegundaParte: AppRepeticionClientePapelSegundaParte[] = [];
  papelSegundaParte: AppRepeticionClientePapelSegundaParte;

  papelesTerceraParte: AppRepeticionClientePapelTerceraParte[] = [];
  papelTerceraParte: AppRepeticionClientePapelTerceraParte;

  papelesCuartaParte: AppRepeticionClientePapelCuartaParte[] = [];
  papelCuartaParte: AppRepeticionClientePapelCuartaParte;

  papelesQuintaParte: AppRepeticionClientePapelQuintaParte[] = [];
  papelQuintaParte: AppRepeticionClientePapelQuintaParte;





  dtTrigger: Subject<any> = new Subject<any>();

  private subjectKeyUp = new Subject<any>();

  constructor(
    private router: Router,
    private repeticionesService: RepeticionesService,
    private cotizacionesService: CotizacionesListService,
    private actionSheetCtrl: ActionSheetController,
    public generalService: GeneralService,
    private modalCtrl: ModalController,

  ) { }

  ngOnInit() {
    this.subjectKeyUp.pipe((debounceTime(1000))).subscribe((d) => {
      console.log('recalculando para cantidad :', d);

      this.onFiltrar(d);
    });


    this.cotizacion = this.router.getCurrentNavigation().extras.state.cotizacion;
    this.usuario= this.generalService.GetUsuario();
    console.log('Role Usuario: ',this.usuario.role);

    this.repeticionesFilter = {
      idCliente: this.cotizacion.idCliente //this.searchText
    };
    this.cargando = true;
    console.log('this.repeticionesFilter',this.repeticionesFilter);
    this.repeticionesService.GetAllRepeticiones(this.repeticionesFilter)
      .subscribe(result => {

        console.log('result de lista repeticiones: result.data ', result.data);
        this.listaRepeticiones = result.data;
        this.appOrdenProductoRepeticionGetDto = result.data.appOrdenProductoRepeticionGetDto;
        this.productos = result.data.appRepeticionClienteProducto;
        console.log('result de lista repeticiones: ', this.listaRepeticiones);

        this.cargando = false;
        this.dtTrigger.next();
        //event.target.complete();
      });
  }

  ionViewDidEnter() {


    this.cotizacionesService.cotizacion$.subscribe(dat => {
      this.cotizacion = dat;

    });

  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  gotoBack() {
    const itemProd = this.cotizacion.appDetailQuotesGetDto[0];
    this.router.navigate(['edit-detalle-cotizacion'], { state: { cotizacion: this.cotizacion, item: itemProd, operacion: 0 } });

  }
  refresh() {

    this.repeticionesFilter = {
      idCliente: this.cotizacion.idCliente //this.searchText
    };
    this.cargando = true;

    this.repeticionesService.GetAllRepeticiones(this.repeticionesFilter)
      .subscribe(result => {


        this.listaRepeticiones = result.data;
        this.appOrdenProductoRepeticionGetDto = result.data.appOrdenProductoRepeticionGetDto;
        this.productos = result.data.appRepeticionClienteProducto;
        this.appOrdenProductoRepeticionSelected = null;
        this.nombresForma = null;
        this.medidasBasica = null;
        this.medidasOpuesta = null;
        this.cantidadPartes = null;
        this.cantidadTintas = null;
        this.papelesPrimeraParte = null;
        this.papelesSegundaParte = null;
        this.papelesTerceraParte = null;
        this.papelesCuartaParte = null;
        this.papelesQuintaParte = null;
        this.cargando = false;
        this.dtTrigger.next();
        //event.target.complete();
      });
  }

  ordenChanged(event) {


    this.orden = event;


    this.subjectKeyUp.next('ordenChanged');
  }
  onSave(){
    this.showLoading=true;
    const filter = {
      orden: +this.appOrdenProductoRepeticionSelected.orden,
      idProducto:this.productoSeleccionado.id

    };
    console.log('filter repeticiones update ',filter);
    this.repeticionesService.updateProductoEnOrden(filter)
    .subscribe(result => {

      this.refresh();
      this.showLoading=false;
    });
  }


  nombreProductoChanged(event) {
    console.log('nombreProductoChanged', event.detail.value);
    this.producto = event.detail.value;

    this.subjectKeyUp.next('nombreProductoChanged');
  }

  nombreFormaChanged(event) {
    this.nombreForma = event.detail.value;
    this.subjectKeyUp.next('nombreFormaChanged');
  }
  basicaChanged(event) {
    this.medidaBasica = event.detail.value;

    this.subjectKeyUp.next('basicaChanged');
  }
  opuestaChanged(event) {
    this.medidaOpuesta = event.detail.value;
    this.subjectKeyUp.next('opuestaChanged');
  }
  partesChanged(event) {

    this.cantidadParte = event.detail.value;
    this.subjectKeyUp.next('partesChanged');
  }

  tintasChanged(event) {

    this.cantidadTinta = event.detail.value;
    this.subjectKeyUp.next('tintasChanged');
  }
  papelesPrimeraParteChanged(event) {
    this.papelPrimeraParte = event.detail.value;
    this.subjectKeyUp.next('papelesPrimeraParteChanged');
  }
  papelesSegundaParteChanged(event) {
    this.papelSegundaParte = event.detail.value;
    this.subjectKeyUp.next('papelesSegundaParteChanged');
  }
  papelesTerceraParteChanged(event) {
    this.papelTerceraParte = event.detail.value;
    this.subjectKeyUp.next('papelesTerceraParteChanged');
  }
  papelesCuartaParteChanged(event) {
    this.papelCuartaParte = event.detail.value;
    this.subjectKeyUp.next('papelesCuartaParteChanged');
  }
  papelesQuintaParteChanged(event) {
    this.papelQuintaParte = event.detail.value;
    this.subjectKeyUp.next('papelesQuintaParteChanged');
  }


  seleccionarOrden(item: AppOrdenProductoRepeticionGetDto) {

    item = this.appOrdenProductoRepeticionSelected;
    if (this.cotizacion.appDetailQuotesGetDto.length > 0) {
      this.cotizacion.appDetailQuotesGetDto[0].ordenAnterior = +item.orden;
    }
    this.cotizacion.ordenAnterior = +item.orden;
    this.cotizacion.appOrdenProductoRepeticionGetDto = item;
    console.log('Item seleccionado de Repeticion',item);


    let itemProd: AppDetailQuotesGetDto = new AppDetailQuotesGetDto();
    itemProd = this.cotizacion.appDetailQuotesGetDto[0];

    this.cotizacionesService.cotizacion$.next(this.cotizacion);



    //voy al formulario de edicion
    if (itemProd) {

      this.router.navigate(['edit-detalle-cotizacion'], { state: { cotizacion: this.cotizacion, item: itemProd, operacion: 1 } });
    } else {

      this.router.navigate(['edit-detalle-cotizacion'], { state: { cotizacion: this.cotizacion, item: itemProd, operacion: 0 } });
    }

  }

  setItem(item) {
    console.log('iten orden anterio', item);

    this.appOrdenProductoRepeticionSelected = item;

  }

  edit(item: AppDetailQuotesGetDto) {


    //voy al formulario de edicion
    let itemProd: AppDetailQuotesGetDto = new AppDetailQuotesGetDto();
    itemProd = this.cotizacion.appDetailQuotesGetDto[0];

    //voy al formulario de edicion
    if (itemProd) {
      this.router.navigate(['menu/edit-detalle-cotizacion'], { state: { cotizacion: this.cotizacion, item: itemProd, operacion: 1 } });
    } else {
      this.router.navigate(['menu/edit-detalle-cotizacion'], { state: { cotizacion: this.cotizacion, item: itemProd, operacion: 0 } });
    }


    //1 edit
  }
  async presentActionSheet(item) {
    const actionSheet = this.actionSheetCtrl.create({
      header: 'Acciones...',
      buttons: [
        {
          text: 'Seleccionar',
          icon: 'create-outline',
          handler: () => {
            this.seleccionarOrden(item);
          }
        },

        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    (await actionSheet).present();
  }

  async onBuscarProductoGeneral() {

    const modal = await this.modalCtrl.create({
        component: BuscadorProductosComponent,
        componentProps: {
            userConectado: this.generalService.GetUsuario().user,
            subCategoria: 0,
        }
    });

    await modal.present();

    //---

    const { data } = await modal.onDidDismiss();


    if (data) {

        //UI
        this.productoSeleccionado=data;

    }





}

  async onFiltrar(origenLlamada: string) {



    switch (origenLlamada) {

      case 'nombreProductoChanged':

        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto.
        filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto);
        this.nombresForma = this.listaRepeticiones.appRepeticionClienteNombreForma
        .filter(r => r.nombreProducto === this.producto.nombreProducto);

        break;

      case 'nombreFormaChanged':

        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto && r.nombreForma === this.nombreForma.nombreForma);
        this.medidasBasica = this.listaRepeticiones.appRepeticionClienteBasica
        .filter(r => r.nombreProducto === this.producto.nombreProducto && r.nombreForma === this.nombreForma.nombreForma);
        break;


      case 'basicaChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
                r.nombreForma === this.nombreForma.nombreForma && r.basicaHumano === this.medidaBasica.basicaHumano);
        this.medidasOpuesta = this.listaRepeticiones.appRepeticionClienteOpuesta.
        filter(r => r.nombreProducto === this.producto.nombreProducto && r.nombreForma === this.nombreForma.nombreForma
                && r.basicaHumano === this.medidaBasica.basicaHumano);
        break;

      case 'opuestaChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
           r.nombreForma === this.nombreForma.nombreForma &&
           r.basicaHumano === this.medidaBasica.basicaHumano && r.opuestaHumano === this.medidaOpuesta.opuestaHumano);
        this.cantidadPartes = this.listaRepeticiones.appRepeticionClientePartes
        .filter(r => r.nombreProducto === this.producto.nombreProducto &&
          r.nombreForma === this.nombreForma.nombreForma &&
          r.basicaHumano === this.medidaBasica.basicaHumano &&
          r.opuestaHumano === this.medidaOpuesta.opuestaHumano);
        break;
      case 'partesChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
           r.nombreForma === this.nombreForma.nombreForma &&
          r.basicaHumano === this.medidaBasica.basicaHumano && r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
          r.partesFormula === this.cantidadParte.partes_formula);
        this.cantidadTintas = this.listaRepeticiones.appRepeticionClienteTintas
        .filter(r => r.nombreProducto === this.producto.nombreProducto &&
          r.nombreForma === this.nombreForma.nombreForma &&
          r.basicaHumano === this.medidaBasica.basicaHumano &&
          r.opuestaHumano === this.medidaOpuesta.opuestaHumano && r.partes_formula === this.cantidadParte.partes_formula);
        break;
      case 'tintasChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto.
        filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
          r.nombreForma === this.nombreForma.nombreForma &&
          r.basicaHumano === this.medidaBasica.basicaHumano &&
          r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
          r.partesFormula === this.cantidadParte.partes_formula &&
          r.cantTintas === this.cantidadTinta.cant_Tintas);
        this.papelesPrimeraParte = this.listaRepeticiones.appRepeticionClientePapelPrimeraParte
        .filter(r => r.nombreProducto === this.producto.nombreProducto &&
           r.nombreForma === this.nombreForma.nombreForma &&
            r.basicaHumano === this.medidaBasica.basicaHumano &&
            r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
            r.partes_formula === this.cantidadParte.partes_formula &&
            r.cant_Tintas === this.cantidadTinta.cant_Tintas);
            break;
      case 'papelesPrimeraParteChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null &&
           r.nombreProducto === this.producto.nombreProducto &&
            r.nombreForma === this.nombreForma.nombreForma &&
            r.basicaHumano === this.medidaBasica.basicaHumano &&
            r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
            r.partesFormula === this.cantidadParte.partes_formula &&
            r.cantTintas === this.cantidadTinta.cant_Tintas &&
            r.papelPrimeraParte === this.papelPrimeraParte.papelprimeraparte);
        this.papelesSegundaParte = this.listaRepeticiones.appRepeticionClientePapelSegundaParte
        .filter(r => r.nombreProducto === this.producto.nombreProducto &&
            r.nombreForma === this.nombreForma.nombreForma &&
            r.basicaHumano === this.medidaBasica.basicaHumano &&
            r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
            r.partes_formula === this.cantidadParte.partes_formula &&
            r.cant_Tintas === this.cantidadTinta.cant_Tintas &&
            r.papelprimeraparte === this.papelPrimeraParte.papelprimeraparte);
        break;
      case 'papelesSegundaParteChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
            r.nombreForma === this.nombreForma.nombreForma &&
            r.basicaHumano === this.medidaBasica.basicaHumano &&
            r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
            r.partesFormula === this.cantidadParte.partes_formula &&
            r.cantTintas === this.cantidadTinta.cant_Tintas &&
            r.papelPrimeraParte === this.papelPrimeraParte.papelprimeraparte &&
            r.papelSegundaParte === this.papelSegundaParte.papelsegundaparte);
        this.papelesTerceraParte = this.listaRepeticiones.appRepeticionClientePapelTerceraParte.
            filter(r => r.nombreProducto === this.producto.nombreProducto &&
                r.nombreForma === this.nombreForma.nombreForma &&
                r.basicaHumano === this.medidaBasica.basicaHumano &&
                r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
                r.partes_formula === this.cantidadParte.partes_formula &&
                r.cant_Tintas === this.cantidadTinta.cant_Tintas &&
                r.papelprimeraparte === this.papelPrimeraParte.papelprimeraparte &&
                r.papelsegundaparte === this.papelSegundaParte.papelsegundaparte);
        break;
      case 'papelesTerceraParteChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
                r.nombreForma === this.nombreForma.nombreForma &&
                r.basicaHumano === this.medidaBasica.basicaHumano &&
                r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
                r.partesFormula === this.cantidadParte.partes_formula &&
                r.cantTintas === this.cantidadTinta.cant_Tintas &&
                r.papelPrimeraParte === this.papelPrimeraParte.papelprimeraparte &&
                r.papelSegundaParte === this.papelSegundaParte.papelsegundaparte &&
                r.papelTerceraParte === this.papelTerceraParte.papelterceraparte);
        this.papelesCuartaParte = this.listaRepeticiones.appRepeticionClientePapelCuartaParte
        .filter(r => r.nombreProducto === this.producto.nombreProducto &&
                r.nombreForma === this.nombreForma.nombreForma &&
                r.basicaHumano === this.medidaBasica.basicaHumano &&
                r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
                r.partes_formula === this.cantidadParte.partes_formula &&
                r.cant_Tintas === this.cantidadTinta.cant_Tintas &&
                r.papelprimeraparte === this.papelPrimeraParte.papelprimeraparte &&
                r.papelsegundaparte === this.papelSegundaParte.papelsegundaparte &&
                r.papelterceraparte === this.papelTerceraParte.papelterceraparte);
        break;
      case 'papelesCuartaParteChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
                r.nombreForma === this.nombreForma.nombreForma &&
                r.basicaHumano === this.medidaBasica.basicaHumano &&
                r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
                r.partesFormula === this.cantidadParte.partes_formula &&
                r.cantTintas === this.cantidadTinta.cant_Tintas &&
                r.papelPrimeraParte === this.papelPrimeraParte.papelprimeraparte &&
                r.papelSegundaParte === this.papelSegundaParte.papelsegundaparte &&
                r.papelTerceraParte === this.papelTerceraParte.papelterceraparte &&
                r.papelCuartaParte === this.papelCuartaParte.papelcuartaparte);
        this.papelesQuintaParte = this.listaRepeticiones.appRepeticionClientePapelQuintaParte
        .filter(r => r.nombreProducto === this.producto.nombreProducto &&
                r.nombreForma === this.nombreForma.nombreForma &&
                r.basicaHumano === this.medidaBasica.basicaHumano &&
                r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
                r.partes_formula === this.cantidadParte.partes_formula &&
                r.cant_Tintas === this.cantidadTinta.cant_Tintas &&
                r.papelprimeraparte === this.papelPrimeraParte.papelprimeraparte &&
                r.papelsegundaparte === this.papelSegundaParte.papelsegundaparte &&
                r.papelterceraparte === this.papelTerceraParte.papelterceraparte &&
                r.papelcuartaparte === this.papelCuartaParte.papelcuartaparte);
        break;
      case 'papelesQuintaParteChanged':
        this.appOrdenProductoRepeticionGetDto = this.listaRepeticiones.appOrdenProductoRepeticionGetDto
        .filter(r => r !== null && r.nombreProducto === this.producto.nombreProducto &&
              r.nombreForma === this.nombreForma.nombreForma &&
              r.basicaHumano === this.medidaBasica.basicaHumano &&
              r.opuestaHumano === this.medidaOpuesta.opuestaHumano &&
              r.partesFormula === this.cantidadParte.partes_formula &&
              r.cantTintas === this.cantidadTinta.cant_Tintas &&
              r.papelPrimeraParte === this.papelPrimeraParte.papelprimeraparte &&
              r.papelSegundaParte === this.papelSegundaParte.papelsegundaparte &&
              r.papelTerceraParte === this.papelTerceraParte.papelterceraparte &&
              r.papelCuartaParte === this.papelCuartaParte.papelcuartaparte &&
              r.papelQuintaParte === this.papelQuintaParte.papelquintaparte);

        break;


    }





  }

}
