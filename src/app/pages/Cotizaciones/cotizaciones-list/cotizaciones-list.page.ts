import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  NavController,
  LoadingController,
} from '@ionic/angular';
import { GeneralService } from 'src/app/services/general.service';
import { CotizacionesListService } from '../../../services/cotizaciones/cotizaciones-list.service';
import { AppGeneralQuotesQueryFilter } from 'src/app/interfaces/App-General-Quotes-Query-Filter';
import { AppGeneralQuotesCopyDto } from '../../../models/app-general-quotes-ccopy-dto';
import { AppGeneralQuotesChangeStatusDto } from 'src/app/models/app-general-quotes-change-status-dto';
import { filter } from 'rxjs/operators';
import { AppGeneralQuotesDeleteDto } from 'src/app/models/app-general-quotes-delete-dto';
import { UpperCasePipe } from '@angular/common';
import { th } from 'date-fns/locale';
import { AppStatusQuoteGetDto } from '../../../models/app-status-quote-get-dto';

interface CotizacionesListFilters {
  fechaDesde: string;
  fechaHasta: string;
  searchText: string;
  statusId: number;
  pageSize: number;
}

@Component({
  selector: 'app-cotizaciones-list',
  templateUrl: './cotizaciones-list.page.html',
  styleUrls: ['./cotizaciones-list.page.scss'],
})
export class CotizacionesListPage implements OnInit, OnDestroy {
  private readonly storageKey = 'cotizacionesListFilters';

  appGeneralQuotesGetDtoArray: any[] = [];
  fechaDesde: string;
  fechaHasta: string;
  searchText: string = '';
  statusId: number = 0;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalRecords: number = 0;
  totalPages: number = 0;

  cargando: boolean = false;
  mensaje: string = '';
  usuario: any;
  nombreUsuario: string = '';
  skeletonCount = [1, 2, 3, 4, 5, 6];

  listReg: number[] = [5, 10, 20, 50, 100];
  listEstatus: any[] = [
    { id: 0, descripcion: 'Todos' },
    { id: 1, descripcion: 'En Grabación' },
    { id: 2, descripcion: 'En espera por Cliente' },
    { id: 3, descripcion: 'Postergada' },
    { id: 5, descripcion: 'Ganada' },
    { id: 6, descripcion: 'Perdida' },
  ];

  constructor(
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private gs: GeneralService,
    private cotizacionesService: CotizacionesListService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.setDefaultFilters();
    this.loadSavedFilters();

    this.usuario = this.gs.GetUsuario();
    if (this.usuario) {
      this.nombreUsuario = `(${this.usuario.user})`;
    }
    this.cotizacionesService.filterSearchText = this.searchText;

    if (this.cargando) return;
    this.loadQuotes(this.searchText);
  }

  ionViewDidEnter() {
    this.loadQuotes(this.searchText);
  }

  ngOnDestroy() {}

  async loadQuotes(searhTextBusqueda?: string) {
    //if (this.cargando) return;

    this.cargando = true;
    this.mensaje = '';
    const searchText = searhTextBusqueda ?? this.searchText;

    const filter: AppGeneralQuotesQueryFilter = {
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      usuarioConectado: this.usuario.user,
      cotizacion: '',
      searchText,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      statusId: this.statusId,
    };

    this.cotizacionesService.GetAllGeneralCotizacion(filter).subscribe({
      next: (res) => {
        this.appGeneralQuotesGetDtoArray = res.data;
        this.totalRecords = res.meta.totalCount;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.mensaje = res.meta.message;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.gs.presentToast('Error al conectar con el servidor', 'danger');
      },
    });
  }

  // --- Manejo de Eventos ---
  private setDefaultFilters() {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);
    this.fechaDesde = currentDate.toISOString();
    this.fechaHasta = new Date().toISOString();
    this.searchText = '';
    this.statusId = 0;
    this.pageSize = 5;
  }

  private loadSavedFilters() {
    const rawFilters = localStorage.getItem(this.storageKey);
    if (!rawFilters) return;

    try {
      const filters = JSON.parse(rawFilters) as Partial<CotizacionesListFilters>;
      this.fechaDesde = filters.fechaDesde ?? this.fechaDesde;
      this.fechaHasta = this.getFechaHastaVigente(
        filters.fechaHasta ?? this.fechaHasta,
      );
      this.searchText = filters.searchText ?? '';
      this.statusId = filters.statusId ?? 0;
      this.pageSize = filters.pageSize ?? 5;
      this.saveFilters();
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private getFechaHastaVigente(fechaHasta: string): string {
    const fechaGuardada = new Date(fechaHasta);

    if (Number.isNaN(fechaGuardada.getTime())) {
      return new Date().toISOString();
    }

    const hoy = new Date();
    const inicioHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );

    return fechaGuardada < inicioHoy ? hoy.toISOString() : fechaHasta;
  }

  private saveFilters() {
    const filters: CotizacionesListFilters = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      searchText: this.searchText,
      statusId: this.statusId,
      pageSize: this.pageSize,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(filters));
  }

  refresh() {
    this.currentPage = 1;
    this.appGeneralQuotesGetDtoArray = [];
    this.loadQuotes(this.searchText);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.saveFilters();
    this.loadQuotes(this.searchText);
  }

  optionsStatus($event: any) {
    this.statusId = $event.detail?.value ?? $event.target?.value ?? 0;
    this.saveFilters();
    this.refresh();
  }

  onFechaDesdeChange($event: any) {
    this.fechaDesde = $event.detail?.value ?? this.fechaDesde;
    this.saveFilters();
    this.refresh();
  }

  onFechaHastaChange($event: any) {
    this.fechaHasta = $event.detail?.value ?? this.fechaHasta;
    this.saveFilters();
    this.refresh();
  }

  onChangeSearchText(event: any) {
    // 1. Intentamos obtener el valor de detail (Ionic) o de target (DOM estándar)
    const val =
      event.detail?.value !== undefined
        ? event.detail.value
        : event.target?.value;

    console.log('Valor capturado:', val); // Ahora debería mostrar el texto

    // Actualizamos la variable local para que el filtro sea consistente
    this.searchText = val ?? '';
    // GUARDAMOS en el servicio para que no se pierda al navegar
    this.cotizacionesService.filterSearchText = this.searchText;
    this.saveFilters();

    // 2. Limpiar la lista para feedback visual inmediato (Skeleton)
    this.appGeneralQuotesGetDtoArray = [];

    // 3. Actualizar la variable manualmente (asegurando que no sea undefined)
    console.log('val', val);

    // 4. Resetear página
    this.currentPage = 1;

    // 5. Llamar al servicio
    this.loadQuotes(this.searchText);
  }

  // --- Paginación ---
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadQuotes();
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadQuotes();
    }
  }
  goToPage(p: number) {
    this.currentPage = p;
    this.loadQuotes();
  }

  // --- Visualización de Iconos ---
  getIconByStatus(clase: string) {
    const icons = {
      enGrabacion: 'pencil-outline',
      enEspera: 'time-outline',
      ganada: 'checkmark-circle-outline',
      perdida: 'close-circle-outline',
      postergada: 'pause-circle-outline',
    };
    return icons[clase] || 'document-text-outline';
  }

  getIconColor(clase: string) {
    const colors = {
      enGrabacion: 'primary',
      enEspera: 'warning',
      ganada: 'success',
      perdida: 'danger',
      postergada: 'medium',
    };
    return colors[clase] || 'medium';
  }

  // --- Action Sheet ---
  async presentActionSheet(item: any) {
    const actionSheetDto = item.appGeneralQuotesActionSheetDto;
    const opcionesMenu = [];
    var tituloRetornarEliminarSolicitudPrecio = 'Retornar Grabación';
    console.log(item);
    if (item.appStatusQuoteGetDto.enGrabacion) {
      tituloRetornarEliminarSolicitudPrecio = 'Eliminar Solicitud de Precio';
    }
    const acciones = [
      {
        text: 'Actualizar o Ver',
        icon: 'create-outline',
        show: true,
        handler: () => this.actualizarCotizacion(item),
      },
      {
        text: 'Productos',
        icon: 'list-outline',
        show: true,
        handler: () => this.mantenerDetalleCotizacion(item),
      },
      {
        text: 'Enviar al Cliente',
        icon: 'send-outline',
        show: actionSheetDto.enviarAlCliente,
        handler: () => this.enviarAlCliente(item),
      },
      {
        text: 'Ganar-Perder',
        icon: 'git-compare-outline',
        show: actionSheetDto.ganarPerder,
        handler: () => this.GanarPerderCotiza(item),
      },
      {
        text: 'Retornar Grabación',
        icon: 'refresh-outline',
        show: actionSheetDto.retornarAGrabacion,
        handler: () => this.presentAlertRetornarAGrabacion(item),
      },
      {
        text: 'Eliminar Solicitud de Precio',
        icon: 'refresh-outline',
        show: actionSheetDto.eliminarSolicitudPrecio,
        handler: () => this.presentAlertEliminarSolicitudPrecio(item),
      },

      {
        text: 'Postergar',
        icon: 'calendar-clear-outline',
        show: actionSheetDto.postergar,
        handler: () => this.postergarCotiza(item),
      },
      {
        text: 'Imprimir',
        icon: 'print-outline',
        show: actionSheetDto.imprimir,
        handler: () => this.imprimirCotiza(item),
      },
      {
        text: 'Copiar',
        icon: 'copy-outline',
        show: true,
        handler: () => this.presentAlertCopiar(item),
      },
      {
        text: 'Eliminar',
        icon: 'trash-outline',
        show: actionSheetDto.eliminar,
        role: 'destructive',
        //handler: () => this.eliminarCotiza(item),
        handler: () => this.presentAlertDelete(item),
      },
    ];

    acciones.forEach((acc) => {
      if (acc.show) {
        opcionesMenu.push({
          text: acc.text,
          icon: acc.icon,
          role: acc.role || '',
          handler: acc.handler,
        });
      }
    });

    opcionesMenu.push({ text: 'Cancelar', icon: 'close', role: 'cancel' });

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Acciones: ${item.cotizacion}`,
      buttons: opcionesMenu,
    });
    await actionSheet.present();
  }

  // --- MÉTODOS DE ACCIÓN ---

  onClickAdd() {
    this.router.navigate(['/menu/cotizacion-edit'], {
      state: { operacion: 0 },
    });
  }

  actualizarCotizacion(cotizacion: any) {
    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/menu/cotizacion-edit'], {
      state: { flag: true, itemCliente: cotizacion.mtrClienteDto },
    });
  }

  mantenerDetalleCotizacion(cotizacion: any) {
    const detalles = cotizacion.appDetailQuotesGetDto || [];
    const item = detalles[0];

    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/edit-detalle-cotizacion'], {
      state: {
        cotizacion,
        item,
        operacion: item ? 1 : 0,
      },
    });
  }

  GanarPerderCotiza(cotizacion: any) {
    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/cotizacion-ganar-perder'], {
      state: { cotizacion },
    });
  }

  postergarCotiza(cotizacion: any) {
    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/cotizacion-postergar'], { state: {} });
  }

  eliminarCotiza(cotizacion: any) {
    console.log('Eliminar', cotizacion);
    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/cotizacion-delete'], { state: { cotizacion } });
  }

  imprimirCotiza(cotizacion: any) {
    this.cotizacionesService.cotizacion$.next(cotizacion);
    this.router.navigate(['/menu/imprimir-cotizacion'], {
      state: { cotizacion },
    });
  }

  async enviarAlCliente(cotizacion: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Desea enviar esta cotización al cliente?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Si',
          handler: () => {
            this.cargando = true;
            const dto: AppGeneralQuotesChangeStatusDto = { id: cotizacion.id };
            this.cotizacionesService
              .EnviarAlCliente(dto)
              .subscribe((result) => {
                this.cargando = false;
                if (result.meta.isValid) {
                  this.gs.presentToast(result.meta.message, 'success');
                  this.refresh();
                } else {
                  this.gs.presentToast(result.meta.message, 'danger');
                }
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async presentAlertCopiar(cotizacion: any) {
    const alert = await this.alertController.create({
      message: '¿Está seguro de copiar esta Cotización?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            const dto: AppGeneralQuotesCopyDto = {
              id: cotizacion.id,
              usuarioActualiza: this.usuario.user,
            };
            this.cotizacionesService
              .CopiarCotizacion(dto)
              .subscribe(() => this.refresh());
          },
        },
      ],
    });
    await alert.present();
  }

  async presentAlertRetornarAGrabacion(cotizacion: any) {
    const alert = await this.alertController.create({
      message: '¿Desea retornar a grabación esta Cotización?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.cargando = true;
            const dto: AppGeneralQuotesCopyDto = {
              id: cotizacion.id,
              usuarioActualiza: this.usuario.user,
            };
            this.cotizacionesService.RetornarAGrabacion(dto).subscribe(() => {
              this.cargando = false;
              this.refresh();
            });
          },
        },
      ],
    });
    await alert.present();
  }
  async presentAlertEliminarSolicitudPrecio(cotizacion: any) {
    const alert = await this.alertController.create({
      message: '¿Desea Eliminar Solicitud de Precio de esta Cotización?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.cargando = true;
            const dto: AppGeneralQuotesCopyDto = {
              id: cotizacion.id,
              usuarioActualiza: this.usuario.user,
            };
            console.log('dto retornar a grabación', dto);
            this.cotizacionesService.RetornarAGrabacion(dto).subscribe(() => {
              this.cargando = false;
              this.refresh();
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async presentAlertDelete(cotizacion: any) {
    const alert = await this.alertController.create({
      message: '¿Desea Eliminar esta Cotización?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.cargando = true;
            const dto: AppGeneralQuotesDeleteDto = {
              id: cotizacion.id,
              cotizacion: cotizacion.cotizacion,
            };
            this.cotizacionesService
              .DeleteGeneralCotizacion(dto)
              .subscribe(() => {
                this.cargando = false;
                this.refresh();
              });
          },
        },
      ],
    });
    await alert.present();
  }
}
