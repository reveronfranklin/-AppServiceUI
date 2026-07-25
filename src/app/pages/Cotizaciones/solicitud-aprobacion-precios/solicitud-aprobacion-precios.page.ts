import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import {
  AppSolicitudAprobacion,
  AppSolicitudAprobacionLoteResponse,
  GetAllPagedAppSolicitudAprobacionQuery,
  ListSolicitudesPendientesAppSolicitudAprobacionQuery,
  ResultDto,
} from 'src/app/models/app-solicitud-aprobacion.model';
import { AppSolicitudAprobacionService } from 'src/app/services/app-solicitud-aprobacion.service';
import { GeneralService } from 'src/app/services/general.service';

type SegmentoSolicitudes = 'todas' | 'pendientes';

interface ExportColumn<T> {
  header: string;
  value: (row: T) => any;
}

@Component({
  selector: 'app-solicitud-aprobacion-precios',
  templateUrl: './solicitud-aprobacion-precios.page.html',
  styleUrls: ['./solicitud-aprobacion-precios.page.scss'],
})
export class SolicitudAprobacionPreciosPage implements OnInit, OnDestroy {
  solicitudes: AppSolicitudAprobacion[] = [];
  solicitudDetalle: AppSolicitudAprobacion = null;
  segmento: SegmentoSolicitudes = 'pendientes';
  fechaDesde: string;
  fechaHasta: string;
  searchText = '';
  searchTextPendientes = '';
  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;
  totalPages = 0;
  cargando = false;
  mensaje = '';
  procesandoId: number = null;
  procesandoLote = false;
  usuario: any;
  nombreUsuario = '';
  ultimaActualizacionPendientes = '';
  listReg: number[] = [5, 10, 20, 50, 100];
  skeletonCount = [1, 2, 3, 4, 5, 6];
  pendientesCargadas: AppSolicitudAprobacion[] = [];
  private readonly autoRefreshMs = 60000;
  private autoRefreshSub: Subscription;
  private refrescandoPendientes = false;
  private solicitudesSeleccionadas = new Set<string>();

  constructor(
    private solicitudService: AppSolicitudAprobacionService,
    public generalService: GeneralService,
    private alertController: AlertController,
    private modalController: ModalController,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.usuario = this.generalService.GetUsuario();
    this.nombreUsuario = this.usuario?.user ? `(${this.usuario.user})` : '';
    this.setDefaultFilters();
    this.loadSolicitudes();
    this.startPendientesAutoRefresh();
  }

  ionViewDidEnter() {
    this.loadSolicitudes();
    this.startPendientesAutoRefresh();
  }

  ionViewDidLeave() {
    this.stopPendientesAutoRefresh();
  }

  ngOnDestroy() {
    this.stopPendientesAutoRefresh();
  }

  setDefaultFilters() {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    this.fechaDesde = desde.toISOString();
    this.fechaHasta = new Date().toISOString();
  }

  loadSolicitudes() {
    if (this.segmento === 'pendientes') {
      this.loadPendientes();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    const query: GetAllPagedAppSolicitudAprobacionQuery = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      usuarioConectado: this.usuario?.user ?? '',
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      searchText: this.searchText ?? '',
    };

    this.solicitudService.getAllPaged(query).subscribe({
      next: (res) => this.handleListResponse(res),
      error: (err) => this.handleHttpError(err),
    });
  }

  loadPendientes(showLoading = true) {
    if (!showLoading && this.refrescandoPendientes) return;

    if (showLoading) {
      this.cargando = true;
    } else {
      this.refrescandoPendientes = true;
    }
    this.mensaje = '';
    const query: ListSolicitudesPendientesAppSolicitudAprobacionQuery = {
      UsuarioConectado: this.usuario?.user ?? '',
    };

    this.solicitudService.listPendientes(query).subscribe({
      next: (res) => {
        if (!showLoading && this.segmento !== 'pendientes') {
          this.refrescandoPendientes = false;
          return;
        }

        this.handleListResponse(res, true, showLoading);
      },
      error: (err) => this.handleHttpError(err, showLoading),
    });
  }

  handleListResponse(
    res: ResultDto<AppSolicitudAprobacion[]>,
    pendientes = false,
    showLoading = true,
  ) {
    const isValid = this.isValidResponse(res);
    const data = res?.data ?? [];

    if (isValid) {
      if (pendientes) {
        this.pendientesCargadas = data.filter((item) => this.isPendiente(item));
        this.applyPendientesSearch();
        this.pruneSelectedSolicitudes();
      } else {
        this.solicitudes = data;
      }
      this.totalRecords = pendientes
        ? this.solicitudes.length
        : this.getTotalRecords(res, this.solicitudes.length);
      this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
      this.mensaje = this.getMessage(res);
      if (pendientes) {
        this.updateUltimaActualizacionPendientes();
      }
    } else {
      this.solicitudes = [];
      if (pendientes) {
        this.pendientesCargadas = [];
        this.clearSelection();
      }
      this.totalRecords = 0;
      this.totalPages = 0;
      this.mensaje = this.getMessage(res) || 'No se pudo cargar la información';
      if (showLoading) {
        this.generalService.presentToast(this.mensaje, 'danger');
      }
    }

    if (showLoading) {
      this.cargando = false;
    } else {
      this.refrescandoPendientes = false;
    }

    this.changeDetectorRef.markForCheck();
  }

  handleHttpError(err: any, showLoading = true) {
    console.error('Error solicitudes aprobación precios', err);
    if (showLoading) {
      this.cargando = false;
    } else {
      this.refrescandoPendientes = false;
    }
    this.mensaje = 'Error al conectar con el servidor';
    if (showLoading) {
      this.generalService.presentToast(this.mensaje, 'danger');
    }
  }

  onSegmentChange(event: any) {
    this.segmento = event.detail?.value ?? 'pendientes';
    this.currentPage = 1;
    this.loadSolicitudes();
    if (this.segmento === 'pendientes') {
      this.startPendientesAutoRefresh();
    } else {
      this.stopPendientesAutoRefresh();
    }
  }

  onFechaDesdeChange(event: any) {
    this.fechaDesde = event.detail?.value ?? this.fechaDesde;
    this.refresh();
  }

  onFechaHastaChange(event: any) {
    this.fechaHasta = event.detail?.value ?? this.fechaHasta;
    this.refresh();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadSolicitudes();
  }

  onSearchChange(event: any) {
    this.searchText = event.detail?.value ?? '';
    this.currentPage = 1;
    this.loadSolicitudes();
  }

  onPendientesSearchChange(event: any) {
    this.searchTextPendientes = event.detail?.value ?? '';
    this.applyPendientesSearch();
  }

  toggleSolicitudSelection(solicitud: AppSolicitudAprobacion, event: any) {
    const key = this.getSolicitudKey(solicitud);
    const selected = event.detail?.checked === true;

    if (selected) {
      this.solicitudesSeleccionadas.add(key);
    } else {
      this.solicitudesSeleccionadas.delete(key);
    }
  }

  toggleVisibleSelection() {
    if (this.areVisibleSolicitudesSelected()) {
      this.solicitudes.forEach((solicitud) =>
        this.solicitudesSeleccionadas.delete(this.getSolicitudKey(solicitud)),
      );
      return;
    }

    this.solicitudes
      .filter((solicitud) => this.isPendiente(solicitud))
      .forEach((solicitud) =>
        this.solicitudesSeleccionadas.add(this.getSolicitudKey(solicitud)),
      );
  }

  clearSelection() {
    this.solicitudesSeleccionadas.clear();
  }

  isSolicitudSelected(solicitud: AppSolicitudAprobacion): boolean {
    return this.solicitudesSeleccionadas.has(this.getSolicitudKey(solicitud));
  }

  getSelectedCount(): number {
    return this.solicitudesSeleccionadas.size;
  }

  getSelectVisibleLabel(): string {
    return this.areVisibleSolicitudesSelected()
      ? 'Quitar visibles'
      : 'Seleccionar visibles';
  }

  canProcessBatch(): boolean {
    return this.getSelectedCount() > 0 && !this.procesandoLote && !this.cargando;
  }

  async confirmarAprobarLote() {
    await this.confirmarAccionLote('aprobar');
  }

  async confirmarRechazarLote() {
    await this.confirmarAccionLote('rechazar');
  }

  refresh() {
    this.currentPage = 1;
    this.loadSolicitudes();
  }

  exportarExcel() {
    if (!this.solicitudes.length) {
      this.generalService.presentToast('No hay datos para exportar.', 'warning');
      return;
    }

    const htmlTable = this.buildExcelTable(
      this.solicitudes,
      this.getExportColumns(),
    );

    this.downloadFile(
      htmlTable,
      `solicitud_aprobacion_precios_${this.segmento}_${this.getTimestamp()}.xls`,
      'application/vnd.ms-excel;charset=utf-8;',
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages && !this.cargando) {
      this.currentPage++;
      this.loadSolicitudes();
    }
  }

  previousPage() {
    if (this.currentPage > 1 && !this.cargando) {
      this.currentPage--;
      this.loadSolicitudes();
    }
  }

  openDetalle(solicitud: AppSolicitudAprobacion) {
    this.solicitudDetalle = solicitud;
  }

  closeDetalle() {
    this.solicitudDetalle = null;
  }

  async confirmarAprobar(solicitud: AppSolicitudAprobacion) {
    const alert = await this.alertController.create({
      header: 'Aprobar sobreprecio',
      message: `¿Desea aprobar la solicitud de ${solicitud.codigoProducto}?`,
      inputs: [
        {
          name: 'observacionAprobador',
          type: 'textarea',
          placeholder: 'Indique la observación del aprobador',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aprobar',
          handler: (data) => {
            const observacionAprobador = (
              data?.observacionAprobador || ''
            ).trim();

            if (!observacionAprobador) {
              this.generalService.presentToast(
                'Indique la observación del aprobador',
                'danger',
              );
              return false;
            }

            this.aprobar(solicitud, observacionAprobador);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async confirmarRechazar(solicitud: AppSolicitudAprobacion) {
    const alert = await this.alertController.create({
      header: 'Rechazar sobreprecio',
      message: `¿Desea rechazar la solicitud de ${solicitud.codigoProducto}?`,
      inputs: [
        {
          name: 'observacionAprobador',
          type: 'textarea',
          placeholder: 'Indique la observación del aprobador',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rechazar',
          role: 'destructive',
          handler: (data) => {
            const observacionAprobador = (
              data?.observacionAprobador || ''
            ).trim();

            if (!observacionAprobador) {
              this.generalService.presentToast(
                'Indique la observación del aprobador',
                'danger',
              );
              return false;
            }

            this.rechazar(solicitud, observacionAprobador);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  aprobar(solicitud: AppSolicitudAprobacion, observacionAprobador: string) {
    if (this.procesandoId) return;
    this.procesandoId = solicitud.id;

    this.solicitudService
      .aprobar({
        cotizacion: solicitud.cotizacion,
        producto: solicitud.codigoProducto,
        usuarioAprobador: this.usuario?.user ?? '',
        observacionAprobador,
      })
      .subscribe({
        next: (res) => this.handleActionResponse(res),
        error: (err) => this.handleActionError(err),
      });
  }

  rechazar(solicitud: AppSolicitudAprobacion, observacionAprobador: string) {
    if (this.procesandoId) return;
    this.procesandoId = solicitud.id;

    this.solicitudService
      .rechazar({
        cotizacion: solicitud.cotizacion,
        producto: solicitud.codigoProducto,
        usuarioAprobador: this.usuario?.user ?? '',
        observacionAprobador,
      })
      .subscribe({
        next: (res) => this.handleActionResponse(res),
        error: (err) => this.handleActionError(err),
      });
  }

  aprobarLote(observacionAprobador: string) {
    this.procesarLote('aprobar', observacionAprobador);
  }

  rechazarLote(observacionAprobador: string) {
    this.procesarLote('rechazar', observacionAprobador);
  }

  handleActionResponse(res: ResultDto<AppSolicitudAprobacion>) {
    const message = this.getMessage(res) || 'Operación realizada';
    const color = this.isValidResponse(res) ? 'success' : 'danger';
    this.generalService.presentToast(message, color);
    this.procesandoId = null;
    this.closeDetalle();
    this.loadSolicitudes();
  }

  handleActionError(err: any) {
    console.error('Error actualizando solicitud', err);
    this.procesandoId = null;
    this.generalService.presentToast('Error al conectar con el servidor', 'danger');
  }

  handleBatchActionResponse(res: ResultDto<AppSolicitudAprobacionLoteResponse>) {
    const data = res?.data;
    const message = this.getMessage(res) || 'Operación por lote realizada';
    const color = this.isValidResponse(res) ? 'success' : 'danger';
    const detail =
      data && data.fallidas > 0
        ? `. Fallidas: ${data.fallidas}`
        : '';

    this.generalService.presentToast(`${message}${detail}`, color);
    this.procesandoLote = false;
    this.clearSelection();
    this.loadPendientes();
  }

  handleBatchActionError(err: any) {
    console.error('Error actualizando solicitudes por lote', err);
    this.procesandoLote = false;
    this.generalService.presentToast('Error al conectar con el servidor', 'danger');
  }

  isPendiente(solicitud: AppSolicitudAprobacion): boolean {
    return solicitud && !solicitud.aprobado && !solicitud.rechazado;
  }

  getEstado(solicitud: AppSolicitudAprobacion): string {
    if (solicitud?.aprobado) return 'Aprobada';
    if (solicitud?.rechazado) return 'Rechazada';
    return 'Pendiente';
  }

  getEstadoColor(solicitud: AppSolicitudAprobacion): string {
    if (solicitud?.aprobado) return 'success';
    if (solicitud?.rechazado) return 'danger';
    return 'warning';
  }

  formatDate(value: string): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-VE');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  getPendientesCountText(): string {
    if (this.searchTextPendientes.trim()) {
      return `${this.solicitudes.length} de ${this.pendientesCargadas.length} pendientes`;
    }

    return `${this.pendientesCargadas.length} pendientes`;
  }

  getSelectedCountText(): string {
    const count = this.getSelectedCount();
    return `${count} seleccionada${count === 1 ? '' : 's'}`;
  }

  private isValidResponse(res: ResultDto<any>): boolean {
    return res?.isValid === true || res?.meta?.isValid === true;
  }

  private getMessage(res: ResultDto<any>): string {
    return res?.message || res?.meta?.message || '';
  }

  private getTotalRecords(res: ResultDto<any>, fallback: number): number {
    return (
      res?.cantidadRegistros ||
      res?.meta?.totalCount ||
      res?.meta?.cantidadRegistros ||
      fallback
    );
  }

  private getExportColumns(): ExportColumn<AppSolicitudAprobacion>[] {
    return [
      { header: 'Estado', value: (r) => this.getEstado(r) },
      { header: 'Cotizacion', value: (r) => r.cotizacion },
      { header: 'Codigo Producto', value: (r) => r.codigoProducto },
      { header: 'Descripcion Producto', value: (r) => r.descripcionProducto },
      { header: 'Codigo Cliente', value: (r) => r.codigoCliente },
      { header: 'Razon Social', value: (r) => r.razonSocial },
      { header: 'Vendedor', value: (r) => r.vendedor },
      { header: 'Nombre Vendedor', value: (r) => r.nombreVendedor },
      { header: 'Condicion Pago', value: (r) => r.condicionPago },
      { header: 'Cantidad', value: (r) => this.formatNumber(r.cantidad) },
      { header: 'Precio Venta', value: (r) => this.formatCurrency(r.precioVenta) },
      { header: 'Precio Minimo', value: (r) => this.formatCurrency(r.precioMinimo) },
      { header: 'Precio Maximo', value: (r) => this.formatCurrency(r.precioMaximo) },
      {
        header: 'Porcentaje Sobreprecio',
        value: (r) => `${this.formatNumber(r.porcentajeSobrePrecio)}%`,
      },
      { header: 'Total Venta', value: (r) => this.formatCurrency(r.totalVenta) },
      { header: 'Oficina', value: (r) => r.oficina },
      { header: 'Nombre Oficina', value: (r) => r.nombreOfiicina },
      { header: 'Usuario Solicitante', value: (r) => r.usuarioSolicitante },
      { header: 'Usuario Aprobador', value: (r) => r.usuarioAprobador },
      { header: 'Observacion Solicitante', value: (r) => r.observacionSolicitante },
      { header: 'Observacion Aprobador', value: (r) => r.observacionAprobador },
      { header: 'Fecha Creacion', value: (r) => this.formatDateTime(r.fechaCreacion) },
      { header: 'Fecha Aprobado', value: (r) => this.formatDateTime(r.fechaAprobado) },
      { header: 'Fecha Rechazado', value: (r) => this.formatDateTime(r.fechaRechazado) },
      {
        header: 'Fecha Actualizacion',
        value: (r) => this.formatDateTime(r.fechaActualizacion),
      },
      { header: 'Usuario Actualizacion', value: (r) => r.usuarioActualizacion },
    ];
  }

  private buildExcelTable(
    rows: AppSolicitudAprobacion[],
    columns: ExportColumn<AppSolicitudAprobacion>[],
  ): string {
    const headers = columns
      .map((column) => `<th>${this.escapeHtml(column.header)}</th>`)
      .join('');
    const body = rows
      .map((row) => {
        const cells = columns
          .map((column) =>
            `<td>${this.escapeHtml(this.toDisplayValue(column.value(row)))}</td>`,
          )
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>${headers}</tr>
            </thead>
            <tbody>
              ${body}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  private downloadFile(content: string, fileName: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  private escapeHtml(value: string): string {
    return (value ?? '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private toDisplayValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    return value.toString();
  }

  private formatDateTime(value: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('es-VE');
  }

  private getTimestamp(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}${m}${day}_${hh}${mm}${ss}`;
  }

  private startPendientesAutoRefresh() {
    if (this.autoRefreshSub || this.segmento !== 'pendientes') return;

    this.autoRefreshSub = interval(this.autoRefreshMs).subscribe(() => {
      this.ngZone.run(() => {
        if (
          this.segmento === 'pendientes' &&
          !this.cargando &&
          !this.refrescandoPendientes &&
          !this.procesandoLote &&
          !this.procesandoId
        ) {
          this.loadPendientes(false);
        }
      });
    });
  }

  private stopPendientesAutoRefresh() {
    if (!this.autoRefreshSub) return;

    this.autoRefreshSub.unsubscribe();
    this.autoRefreshSub = null;
  }

  private updateUltimaActualizacionPendientes() {
    this.ultimaActualizacionPendientes = new Date().toLocaleTimeString('es-VE');
  }

  private applyPendientesSearch() {
    const search = this.normalizeSearchValue(this.searchTextPendientes);

    if (!search) {
      this.solicitudes = [...this.pendientesCargadas];
      return;
    }

    this.solicitudes = this.pendientesCargadas.filter((solicitud) =>
      [
        solicitud.cotizacion,
        solicitud.codigoProducto,
        solicitud.descripcionProducto,
        solicitud.codigoCliente,
        solicitud.razonSocial,
        solicitud.vendedor,
        solicitud.nombreVendedor,
        solicitud.condicionPago,
        solicitud.observacionSolicitante,
      ].some((value) => this.normalizeSearchValue(value).includes(search)),
    );
  }

  private async confirmarAccionLote(accion: 'aprobar' | 'rechazar') {
    const total = this.getSelectedCount();
    if (total === 0) return;

    const esAprobacion = accion === 'aprobar';
    const alert = await this.alertController.create({
      header: esAprobacion
        ? 'Aprobar solicitudes'
        : 'Rechazar solicitudes',
      message: `¿Desea ${accion} ${total} solicitud${total === 1 ? '' : 'es'}?`,
      inputs: [
        {
          name: 'observacionAprobador',
          type: 'textarea',
          placeholder: 'Indique la observación del aprobador',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: esAprobacion ? 'Aprobar' : 'Rechazar',
          role: esAprobacion ? undefined : 'destructive',
          handler: (data) => {
            const observacionAprobador = (
              data?.observacionAprobador || ''
            ).trim();

            if (!observacionAprobador) {
              this.generalService.presentToast(
                'Indique la observación del aprobador',
                'danger',
              );
              return false;
            }

            if (esAprobacion) {
              this.aprobarLote(observacionAprobador);
            } else {
              this.rechazarLote(observacionAprobador);
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private procesarLote(
    accion: 'aprobar' | 'rechazar',
    observacionAprobador: string,
  ) {
    if (this.procesandoLote || this.getSelectedCount() === 0) return;

    const solicitudes = this.getSelectedSolicitudes().map((solicitud) => ({
      cotizacion: solicitud.cotizacion,
      producto: solicitud.codigoProducto,
    }));

    if (solicitudes.length === 0) {
      this.clearSelection();
      this.generalService.presentToast(
        'No hay solicitudes pendientes seleccionadas',
        'danger',
      );
      return;
    }

    this.procesandoLote = true;
    const command = {
      usuarioAprobador: this.usuario?.user ?? '',
      observacionAprobador,
      solicitudes,
    };

    const request =
      accion === 'aprobar'
        ? this.solicitudService.aprobarLote(command)
        : this.solicitudService.rechazarLote(command);

    request.subscribe({
      next: (res) => this.handleBatchActionResponse(res),
      error: (err) => this.handleBatchActionError(err),
    });
  }

  private getSelectedSolicitudes(): AppSolicitudAprobacion[] {
    return this.pendientesCargadas.filter((solicitud) =>
      this.solicitudesSeleccionadas.has(this.getSolicitudKey(solicitud)),
    );
  }

  private areVisibleSolicitudesSelected(): boolean {
    const visiblesPendientes = this.solicitudes.filter((solicitud) =>
      this.isPendiente(solicitud),
    );

    return (
      visiblesPendientes.length > 0 &&
      visiblesPendientes.every((solicitud) =>
        this.solicitudesSeleccionadas.has(this.getSolicitudKey(solicitud)),
      )
    );
  }

  private pruneSelectedSolicitudes() {
    const pendingKeys = new Set(
      this.pendientesCargadas.map((solicitud) => this.getSolicitudKey(solicitud)),
    );

    Array.from(this.solicitudesSeleccionadas).forEach((key) => {
      if (!pendingKeys.has(key)) {
        this.solicitudesSeleccionadas.delete(key);
      }
    });
  }

  private getSolicitudKey(solicitud: AppSolicitudAprobacion): string {
    return `${solicitud.cotizacion}|${solicitud.codigoProducto}`;
  }

  private normalizeSearchValue(value: any): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
