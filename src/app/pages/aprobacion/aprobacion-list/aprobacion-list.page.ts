/* eslint-disable quote-props */
import { Component, Input, OnInit } from '@angular/core';
import {
  ActionSheetController,
  NavController,
  AlertController,
  ModalController,
} from '@ionic/angular';

import { CotizacionesListService } from '../../../services/cotizaciones/cotizaciones-list.service';
// import { cotizacionesListDto } from '../../../models/cotizaciones-list-dto';
import { NavigationExtras, Router } from '@angular/router';
import { AppGeneralQuotesQueryFilter } from 'src/app/interfaces/App-General-Quotes-Query-Filter';
import { AppGeneralQuotesGetDto } from 'src/app/models/app-general-quotes-get-dto';
import { CondicionPagoQueryFilter } from 'src/app/interfaces/condicion-pago-query-filter';
import { IUsuario } from 'src/app/interfaces/iusuario';
import { GeneralService } from 'src/app/services/general.service';

import { Observable } from 'rxjs';
import { AppStatusQuoteGetDto } from 'src/app/models/app-status-quote-get-dto';
import { AppGeneralQuotesChangeStatusDto } from 'src/app/models/app-general-quotes-change-status-dto';
import { AppGeneralQuotesActionSheetDto } from 'src/app/models/app-general-quotes-action-sheet-dto';
import { TasaPreferencialQueryFilter } from '../../../interfaces/tasa-preferencial-query-filter';
import { TasaPreferencialService } from '../../../services/tasa-preferencial.service';
import { TPaTasaReferencialGetDto } from '../../../models/t-pa-tasa-referencial-get-dto';
import { AppGeneralQuotesCopyDto } from '../../../models/app-general-quotes-ccopy-dto';
import { ClienteService } from 'src/app/services/cliente.service';
import { MtrClienteDto } from 'src/app/models/mtr-cliente-dto';
import { MtrClienteQueryFilter } from 'src/app/interfaces/mtr-cliente-query-filter';
import { MtrClienteDireccionDto } from 'src/app/models/mtr-direcciones-clientes-dto';
import { AprobacionCreatePage } from '../aprobacion-create/aprobacion-create.page';
import { AprobacionEditPage } from '../aprobacion-edit/aprobacion-edit.page';
import { CotizacionesPorAprobarGetDto } from 'src/app/models/CotizacionesPorAprobarGetDto';

@Component({
  selector: 'app-aprobacion-list',
  templateUrl: './aprobacion-list.page.html',
  styleUrls: ['./aprobacion-list.page.scss'],
})
export class AprobacionListPage implements OnInit {
  mtrClienteDto: CotizacionesPorAprobarGetDto[] = [];

  mtrClienteQueryFilter: MtrClienteQueryFilter;
  pageSize = 20;
  page = 0;
  codigoSeleccionado: string;

  //TODO CAMBIAR VARIABLE
  mtrOficinaSelected: string = '';
  defaultOficina: string = 'A';
  //observable
  //cotizacion$: Observable<AppGeneralQuotesGetDto>;
  cotizacion$: Observable<any>;
  fechaDesde: string;
  fechaHasta: string;
  appGeneralQuotesCopyDto: AppGeneralQuotesCopyDto;

  tasaPreferencialQueryFilter: TasaPreferencialQueryFilter;
  tPaTasaReferencialGetDto: TPaTasaReferencialGetDto;

  appGeneralQuotesQueryFilter: AppGeneralQuotesQueryFilter;
  appGeneralQuotesGetDtoArray: AppGeneralQuotesGetDto[] = [];
  condicionPagoQueryFilter: CondicionPagoQueryFilter;
  appStatusQuoteGetDto: AppStatusQuoteGetDto;
  appGeneralQuotesChangeStatusDto: AppGeneralQuotesChangeStatusDto =
    new AppGeneralQuotesChangeStatusDto();
  appGeneralQuotesActionSheetDto: AppGeneralQuotesActionSheetDto;
  cotizacion: AppGeneralQuotesGetDto;

  searchText: string;
  usuario: IUsuario;
  nombreUsuario: string;
  botones = [];
  listReg: number[] = [5, 10, 15, 20, 25, 30];
  estatus: string[] = ['PENDIENTE', 'TODO', 'EXCEPCIONES PENDIENTES'];
  public cargando: boolean;

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private navctrl: NavController,
    private gs: GeneralService,
    private tasaPreferencialService: TasaPreferencialService,
    public alertController: AlertController,
    private clienteService: ClienteService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    const currentDate = new Date();
    this.mtrOficinaSelected = 'PENDIENTE';
    // add a day
    currentDate.setDate(currentDate.getDate() - 90);
    this.fechaDesde = currentDate.toISOString();
    this.fechaHasta = new Date().toISOString();
    this.cargando = false;
  }

  ionViewDidEnter() {
    this.cargando = true;

    const filtro = '';
    this.mtrOficinaSelected = 'PENDIENTE';
    this.usuario = this.gs.GetUsuario();

    this.nombreUsuario = '';
    if (
      this.usuario !== null &&
      this.usuario.nombreUsuario !== null &&
      this.usuario.nombreUsuario !== 'undefined'
    ) {
      this.nombreUsuario =
        '(' + this.usuario.user + '-' + this.usuario.nombreUsuario + ')';
    }

    const filter = {
      usuario: this.usuario.user,
      pageNumber: 1,
      pageSize: 20,
      searchText: filtro,
      estatusPlanta: this.defaultOficina,
    };
    console.log('filter aprobacion', filter);
    this.clienteService
      .listCotizacionesPorAprobarPorUsuario(filter)
      .subscribe((resp) => {
        this.mtrClienteDto = resp;
        this.cargando = false;
      });
  }

  async onChangeOfic(event) {
    console.log('oficina Seleccionada', event.target.value);
    this.mtrOficinaSelected = event.target.value;
    this.refresh();
    console.log('estatus seleccionado', this.mtrOficinaSelected);
  }

  refresh(filtro: any = '?') {
    this.mtrClienteDto = [];
    this.cargando = true;
    let status = '';

    if (filtro === '?') {
      filtro = this.searchText;
    }
    if (this.mtrOficinaSelected === 'PENDIENTE') {
      status = 'A';
    }
    if (this.mtrOficinaSelected === 'EXCEPCIONES PENDIENTES') {
      status = 'E';
    }
    if (this.mtrOficinaSelected === 'TODO') {
      status = '';
    }
    this.usuario = this.gs.GetUsuario();

    const filter = {
      usuario: this.usuario.user,
      pageNumber: 1,
      pageSize: 30,
      searchText: filtro,
      estatusPlanta: status,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
    };
    console.log('filter cotizaciones por aprobar', filter);
    this.clienteService
      .listCotizacionesPorAprobarPorUsuario(filter)
      .subscribe((resp) => {
        this.mtrClienteDto = resp;
        this.cargando = false;
        console.log(this.mtrClienteDto);
      });
  }

  onClickAdd() {
    this.router.navigate(['/menu/cotizacion-edit'], {
      state: { operacion: 0 },
    });
  }

  actualizarCliente(item: CotizacionesPorAprobarGetDto) {
    console.log('actualizar cliente', item);
    //this.router.navigate(['/menu/cotizacion-edit'], { state: { item } });
  }

  cotizar(item: CotizacionesPorAprobarGetDto) {
    console.log('Cotizar', item);
    //this.router.navigate(['/menu/cotizacion-edit'], { state: { item } });
    this.router.navigate(['/menu/cotizacion-edit'], {
      state: { itemCliente: item },
    });
  }

  onClickDetailAdjunto(item) {
    console.log(item);
    this.cotizacion = item;
    console.log(item);

    let navigationExtras: NavigationExtras = {
      state: {
        cotizacion: this.cotizacion,
      },
    };

    this.router.navigate(['menu/adjuntos-cotizacion-list'], navigationExtras);
  }

  async crearCliente(item) {
    let idCliente;
    console.log('Item a enviar', item);
    const modal = await this.modalCtrl.create({
      component: AprobacionCreatePage,
      cssClass: 'create-expense-template-modal',
      componentProps: {
        itemCustomer: item,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log(data);
    this.refresh();
  }

  async editarCliente(item) {
    let idCliente;
    console.log('Item a enviar', item);
    const modal = await this.modalCtrl.create({
      component: AprobacionEditPage,
      cssClass: 'create-expense-template-modal',
      componentProps: {
        itemAprobacion: item,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log(data);
    this.refresh();
  }

  onChangeSearchText(event) {
    this.refresh(event.target.value);
  }

  public async presentActionSheet(item: CotizacionesPorAprobarGetDto) {
    const opcionesMenu = [];

    const dict = {
      actualizar: {
        text: ' Aprobar',
        icon: 'create-outline',
        handler: () => {
          this.editarCliente(item);
        },
      },
      adjuntos: {
        text: 'Adjuntos',
        icon: 'cloud-download-outline',
        handler: () => {
          this.onClickDetailAdjunto(item);
        },
      },

      cancel: {
        text: 'Cancel',
        role: 'cancel',
      },
    };

    // eslint-disable-next-line guard-for-in
    for (const key in dict) {
      const value = dict[key];

      opcionesMenu.push(value);
    }

    const actionSheet = this.actionSheetCtrl.create({
      header: 'Acciones',
      buttons: opcionesMenu,
    });

    (await actionSheet).present();
  }
}
