import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppSolicitudAprobadoresService } from 'src/app/services/app-solicitud-aprobadores.service';
import { GeneralService } from 'src/app/services/general.service';
import {
  AppSolicitudAprobadorResponse,
  OficinaResponse,
  ResultDto,
  UsuarioActivoResponse,
} from 'src/app/models/app-solicitud-aprobador.model';

@Component({
  selector: 'app-solicitud-aprobadores',
  templateUrl: './solicitud-aprobadores.page.html',
  styleUrls: ['./solicitud-aprobadores.page.scss'],
})
export class SolicitudAprobadoresPage implements OnInit {
  form: FormGroup;
  aprobadores: AppSolicitudAprobadorResponse[] = [];
  oficinas: OficinaResponse[] = [];
  usuarios: UsuarioActivoResponse[] = [];
  itemEditando: AppSolicitudAprobadorResponse = null;
  searchText = '';
  oficinaSearchText = '';
  usuarioSearchText = '';
  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;
  totalPages = 0;
  cargando = false;
  guardando = false;
  mensaje = '';
  listReg: number[] = [5, 10, 20, 50, 100];

  constructor(
    private formBuilder: FormBuilder,
    private aprobadoresService: AppSolicitudAprobadoresService,
    private alertController: AlertController,
    public generalService: GeneralService,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.loadUsuarios();
    this.loadOficinas();
    this.loadAprobadores();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      usuario: ['', [Validators.required, Validators.maxLength(50)]],
      oficina: [null, [Validators.required]],
    });
  }

  loadAprobadores() {
    this.cargando = true;
    this.mensaje = '';
    this.aprobadoresService
      .getAllPaged({
        pageSize: this.pageSize,
        pageNumber: this.currentPage,
        searchText: (this.searchText || '').trim(),
      })
      .subscribe({
        next: (res) => this.handleListResponse(res),
        error: (err) => this.handleHttpError(err),
      });
  }

  loadOficinas() {
    this.aprobadoresService
      .getAllOficinas({ searchText: this.oficinaSearchText || '' })
      .subscribe({
        next: (res) => {
          this.oficinas = res?.data || [];
        },
        error: () => {
          this.generalService.presentToast(
            'No se pudieron cargar las oficinas',
            'warning',
          );
        },
      });
  }

  loadUsuarios() {
    this.aprobadoresService
      .getAllUsuariosActivos({ searchText: this.usuarioSearchText || '' })
      .subscribe({
        next: (res: any) => {
          this.usuarios = this.normalizarUsuarios(res?.data || res || []);
        },
        error: () => {
          this.generalService.presentToast(
            'No se pudieron cargar los usuarios activos',
            'warning',
          );
        },
      });
  }

  handleListResponse(res: ResultDto<AppSolicitudAprobadorResponse[]>) {
    const isValid = res?.isValid === true || (res?.meta as any)?.isValid === true;

    if (isValid) {
      this.aprobadores = res?.data || [];
      this.totalRecords =
        res?.cantidadRegistros || this.aprobadores.length || 0;
      this.totalPages =
        res?.totalPage || Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
      this.mensaje = res?.message || '';
    } else {
      this.aprobadores = [];
      this.totalRecords = 0;
      this.totalPages = 0;
      this.mensaje = res?.message || 'No se pudo cargar la información';
      this.generalService.presentToast(this.mensaje, 'danger');
    }

    this.cargando = false;
  }

  handleHttpError(err: any) {
    console.error('Error aprobadores de solicitud', err);
    this.cargando = false;
    this.guardando = false;
    this.mensaje = 'Error al conectar con el servidor';
    this.generalService.presentToast(this.mensaje, 'danger');
  }

  onSearchChange(event: any) {
    this.searchText = event.detail?.value ?? event.target?.value ?? '';
    this.currentPage = 1;
    this.loadAprobadores();
  }

  onOficinaSearchChange(event: any) {
    this.oficinaSearchText = event.detail?.value ?? '';
    this.loadOficinas();
  }

  onUsuarioSearchChange(event: any) {
    this.usuarioSearchText = event.detail?.value ?? '';
    this.loadUsuarios();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadAprobadores();
  }

  refresh() {
    this.currentPage = 1;
    this.loadUsuarios();
    this.loadOficinas();
    this.loadAprobadores();
  }

  nextPage() {
    if (this.currentPage < this.totalPages && !this.cargando) {
      this.currentPage++;
      this.loadAprobadores();
    }
  }

  previousPage() {
    if (this.currentPage > 1 && !this.cargando) {
      this.currentPage--;
      this.loadAprobadores();
    }
  }

  editar(item: AppSolicitudAprobadorResponse) {
    this.itemEditando = item;
    this.agregarUsuarioSeleccionadoSiNoExiste(item.usuario);
    this.form.patchValue({
      usuario: item.usuario || '',
      oficina: item.oficina,
    });
  }

  cancelarEdicion() {
    this.itemEditando = null;
    this.form.reset({
      usuario: '',
      oficina: null,
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.generalService.presentToast(
        'Indique usuario y oficina',
        'warning',
      );
      return;
    }

    this.guardando = true;
    const payload = {
      usuario: (this.form.get('usuario').value || '').trim(),
      oficina: Number(this.form.get('oficina').value || 0),
    };

    const request$ = this.itemEditando
      ? this.aprobadoresService.update({
          id: this.itemEditando.id,
          ...payload,
        })
      : this.aprobadoresService.create(payload);

    request$.subscribe({
      next: (res) => this.handleSaveResponse(res),
      error: (err) => this.handleHttpError(err),
    });
  }

  handleSaveResponse(res: ResultDto<AppSolicitudAprobadorResponse>) {
    this.guardando = false;
    const isValid = res?.isValid === true || (res?.meta as any)?.isValid === true;
    const message = res?.message || (isValid ? 'Success' : 'No se pudo guardar');

    this.generalService.presentToast(message, isValid ? 'success' : 'danger');

    if (isValid) {
      this.cancelarEdicion();
      this.loadAprobadores();
    }
  }

  async confirmarEliminar(item: AppSolicitudAprobadorResponse) {
    const alert = await this.alertController.create({
      header: 'Eliminar aprobador',
      message: `¿Desea eliminar el aprobador ${item.usuario || ''} de la oficina ${
        item.nombreOficina || item.oficina || ''
      }?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminar(item),
        },
      ],
    });

    await alert.present();
  }

  eliminar(item: AppSolicitudAprobadorResponse) {
    this.guardando = true;
    this.aprobadoresService.delete(item.id).subscribe({
      next: (res) => {
        this.guardando = false;
        const isValid =
          res?.isValid === true || (res?.meta as any)?.isValid === true;
        const message =
          res?.message || (isValid ? 'Aprobador eliminado' : 'No se pudo eliminar');

        this.generalService.presentToast(message, isValid ? 'success' : 'danger');

        if (isValid) {
          this.loadAprobadores();
        }
      },
      error: (err) => this.handleHttpError(err),
    });
  }

  getOficinaLabel(oficina: OficinaResponse): string {
    return `${oficina.codigoOficina} - ${oficina.nombreOficina}`;
  }

  getUsuarioValue(usuario: UsuarioActivoResponse): string {
    return (
      usuario?.usuario ||
      usuario?.user ||
      usuario?.codigoUsuario ||
      ''
    ).toString();
  }

  getUsuarioLabel(usuario: UsuarioActivoResponse): string {
    const codigo = this.getUsuarioValue(usuario);
    const nombre =
      usuario?.nombreUsuario ||
      usuario?.nombre ||
      usuario?.descripcion ||
      '';

    return nombre ? `${codigo} - ${nombre}` : codigo;
  }

  private normalizarUsuarios(usuarios: UsuarioActivoResponse[]): UsuarioActivoResponse[] {
    if (!Array.isArray(usuarios)) {
      return [];
    }

    return usuarios.filter((usuario) => this.getUsuarioValue(usuario));
  }

  private agregarUsuarioSeleccionadoSiNoExiste(usuario: string | null) {
    const codigo = (usuario || '').trim();
    if (!codigo) {
      return;
    }

    const existe = this.usuarios.some(
      (item) => this.getUsuarioValue(item).toUpperCase() === codigo.toUpperCase(),
    );

    if (!existe) {
      this.usuarios = [{ usuario: codigo }, ...this.usuarios];
    }
  }

  trackById(_index: number, item: AppSolicitudAprobadorResponse): number {
    return item.id;
  }
}
