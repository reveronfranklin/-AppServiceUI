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
import { Router } from '@angular/router';
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
import { CustomerEditPage } from '../customer-edit/customer-edit.page';
import { CustomerCreatePage } from '../customer-create/customer-create.page';
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.page.html',
  styleUrls: ['./customer-list.page.scss'],
})
export class CustomerListPage implements OnInit {
  mtrClienteDto: MtrClienteDireccionDto[] = [];
  mtrClienteQueryFilter: MtrClienteQueryFilter;
  pageSize = 20;
  page = 0;
  codigoSeleccionado: string;

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

    // add a day
    currentDate.setDate(currentDate.getDate() - 30);
    this.fechaDesde = currentDate.toISOString();
    this.fechaHasta = new Date().toISOString();
    this.cargando = false;
  }

  optionsReg($event) {
    this.pageSize = $event.target.value;
    this.refresh();
  }

  ionViewDidEnter() {
    this.cargando = true;

    const filtro = '';

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
    };
    console.log('filter cliente', filter);
    this.clienteService.listDireccionesClientes(filter).subscribe((resp) => {
      this.mtrClienteDto = resp.data;
      this.cargando = false;
      console.log('Clientes>>>>>>>>', this.mtrClienteDto);
    });
  }

  refresh(filtro: any = '?') {
    this.mtrClienteDto = [];
    this.cargando = true;

    if (filtro === '?') {
      filtro = this.searchText;
    }

    this.usuario = this.gs.GetUsuario();

    const filter = {
      usuario: this.usuario.user,
      pageNumber: 1,
      pageSize: 20,
      searchText: filtro,
    };
    console.log('filter cliente', filter);
    this.clienteService.listDireccionesClientes(filter).subscribe((resp) => {
      this.mtrClienteDto = resp.data;
      this.cargando = false;
      console.log(this.mtrClienteDto);
    });
  }

  onClickAdd() {
    this.router.navigate(['/menu/cotizacion-edit'], {
      state: { operacion: 0 },
    });
  }

  actualizarCliente(item: MtrClienteDireccionDto) {
    console.log('actualizar cliente', item);
    //this.router.navigate(['/menu/cotizacion-edit'], { state: { item } });
  }

  cotizar(item: MtrClienteDireccionDto) {
    console.log('Cotizar', item);
    if (!item.editable) {
      return;
    }
    //this.router.navigate(['/menu/cotizacion-edit'], { state: { item } });
    this.router.navigate(['/menu/cotizacion-edit'], {
      state: { itemCliente: item },
    });
  }

  async crearCliente(item) {
    let idCliente;
    console.log('Item a enviar', item);
    const modal = await this.modalCtrl.create({
      component: CustomerCreatePage,
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
    console.log('Item a enviar', item);
    const modal = await this.modalCtrl.create({
      component: CustomerEditPage,
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

  onChangeSearchText(event) {
    this.refresh(event.target.value);
  }

  public async presentActionSheet(item: MtrClienteDireccionDto) {
    const opcionesMenu = [];

    const dict = {
      actualizar: {
        text: ' Actualizar',
        icon: 'create-outline',
        handler: () => {
          this.editarCliente(item);
        },
      },
      crear: {
        text: ' Crear',
        icon: 'create-outline',
        handler: () => {
          this.crearCliente(item);
        },
      },
      cotizar: {
        text: ' Cotizar',
        icon: 'create-outline',
        handler: () => {
          this.cotizar(item);
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
