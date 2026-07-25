/* eslint-disable quote-props */
import { Component, OnInit } from '@angular/core';
import {
  ActionSheetController,
  ModalController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { IUsuario } from 'src/app/interfaces/iusuario';
import { GeneralService } from 'src/app/services/general.service';

import { ClienteService } from 'src/app/services/cliente.service';
import { MtrClienteDireccionDto } from 'src/app/models/mtr-direcciones-clientes-dto';
import { CustomerEditPage } from '../customer-edit/customer-edit.page';
import { CustomerCreatePage } from '../customer-create/customer-create.page';
import { ContactosListPage } from '../../contactos/contactos-list/contactos-list.page';
import { ClienteRif } from 'src/app/models/cliente-rif';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.page.html',
  styleUrls: ['./customer-list.page.scss'],
})
export class CustomerListPage implements OnInit {
  mtrClienteDto: MtrClienteDireccionDto[] = [];
  searchText: string = '';
  listReg: number[] = [5, 10, 20, 50, 100];

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalRecords: number = 0;
  totalPages: number = 0;

  cargando: boolean = false;
  mensaje: string = '';
  nombreUsuario: string = '';
  usuario: IUsuario;
  skeletonCount = [1, 2, 3, 4, 5, 6];

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private gs: GeneralService,
    private clienteService: ClienteService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.usuario = this.gs.GetUsuario();
    if (
      this.usuario &&
      this.usuario.nombreUsuario &&
      this.usuario.nombreUsuario !== 'undefined'
    ) {
      this.nombreUsuario =
        '(' + this.usuario.user + '-' + this.usuario.nombreUsuario + ')';
    }
  }

  ionViewDidEnter() {
    this.loadCustomers(this.searchText);
  }

  private loadCustomers(searchTextBusqueda?: string) {
    if (!this.usuario) {
      this.usuario = this.gs.GetUsuario();
    }
    if (!this.usuario) {
      this.gs.presentToast('No se encontró usuario conectado', 'warning');
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    const filtro = searchTextBusqueda ?? this.searchText ?? '';
    this.searchText = filtro;

    const filter = {
      usuario: this.usuario.user,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchText: filtro,
    };

    this.clienteService.listDireccionesClientes(filter).subscribe({
      next: (resp) => {
        this.mtrClienteDto = [...(resp?.data ?? [])].sort((left, right) => {
          const leftIsProspecto = left?.codigo?.trim() === '000000';
          const rightIsProspecto = right?.codigo?.trim() === '000000';
          return Number(rightIsProspecto) - Number(leftIsProspecto);
        });
        this.totalRecords = resp?.meta?.totalCount ?? this.mtrClienteDto.length;
        this.totalPages =
          this.totalRecords > 0
            ? Math.ceil(this.totalRecords / this.pageSize)
            : 0;
        this.mensaje = resp?.meta?.message ?? '';
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.gs.presentToast('Error al conectar con el servidor', 'danger');
      },
    });
  }

  refresh() {
    this.currentPage = 1;
    this.mtrClienteDto = [];
    this.loadCustomers();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadCustomers();
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

  isProspecto(item: MtrClienteDireccionDto): boolean {
    return item?.codigo?.trim() === '000000';
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

  async onMantenimientoContactos(item: MtrClienteDireccionDto, event?: Event) {
    event?.stopPropagation();

    const cliente = item?.codigo;
    const rif = item?.rifCliente;

    if (!cliente || (!rif && cliente.trim() !== '000000')) {
      this.gs.presentToast(
        'No se puede abrir contactos: cliente o RIF no disponible',
        'warning',
      );
      return;
    }

    const clienteRif: ClienteRif = {
      cliente: cliente,
      rif: rif ?? '',
    };

    const modal = await this.modalCtrl.create({
      component: ContactosListPage,
      componentProps: {
        clienteRif: clienteRif,
      },
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  onChangeSearchText(event: any) {
    const val =
      event.detail?.value !== undefined
        ? event.detail.value
        : event.target?.value;

    this.searchText = val ?? '';
    this.currentPage = 1;
    this.mtrClienteDto = [];
    this.loadCustomers(this.searchText);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCustomers();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCustomers();
    }
  }

  goToPage(p: number) {
    this.currentPage = p;
    this.loadCustomers();
  }

  public async presentActionSheet(item: MtrClienteDireccionDto) {
    if (this.isProspecto(item)) {
      return;
    }
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
