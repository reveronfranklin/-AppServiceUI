/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  ModalController,
  ToastController,
  NavController,
} from '@ionic/angular';

// Páginas y Componentes
import { SearchClientePage } from '../../clientes/search-cliente/search-cliente.page';
import { SearchContactosPage } from '../../clientes/search-contactos/search-contactos.page';
import { DireccionListPage } from '../../direcciones/direccion-list/direccion-list.page';
import { BuscadorMunicipioComponent } from '../../../components/buscador-municipio/buscador-municipio.component';

// Servicios
import { CotizacionesListService } from '../../../services/cotizaciones/cotizaciones-list.service';
import { CondicionesPagoService } from '../../../services/condiciones-pago.service';
import { GeneralService } from 'src/app/services/general.service';

// Modelos
import { AppGeneralQuotesGetDto } from '../../../models/app-general-quotes-get-dto';
import { MtrClienteDireccionDto } from 'src/app/models/mtr-direcciones-clientes-dto';
import { ContactosListPage } from '../../contactos/contactos-list/contactos-list.page';
import { ClienteRif } from 'src/app/models/cliente-rif';

const rifAssignedToAnotherVendorKeywords = ['rif', 'existe', 'otro', 'vendedor'];

@Component({
  selector: 'app-cotizacion-edit',
  templateUrl: './cotizacion-edit.page.html',
  styleUrls: ['./cotizacion-edit.page.scss'],
})
export class CotizacionEditPage implements OnInit {
  form: FormGroup;
  titulo: string = '';
  _cotizacionTitulo: string = '';
  nombreCliente: string = '';
  nombreContacto: string = '';

  _editar: boolean = false;
  _guardando: boolean = false;
  editable: boolean = true;
  flagInsert: boolean = false;
  flagUpdate: boolean = false;
  flagDirEntrega: boolean = false;
  habilitarDetallePLus: boolean = false;
  consultaRifModalOpen = false;
  consultaRifModalValue = '';

  usuario: any;
  appGeneralQuotesGetDto: AppGeneralQuotesGetDto = new AppGeneralQuotesGetDto();
  condicionPagoDto: any[] = [];
  listMtrTipoMonedasDto = [
    { id: 2, descripcion: 'USD' },
    { id: 1, descripcion: 'BS' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private cotizaService: CotizacionesListService,
    private router: Router,
    private modalCtrl: ModalController,
    private gs: GeneralService,
    private condicionesPago: CondicionesPagoService,
    public toastController: ToastController,
    private navCtrl: NavController,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    const navState = this.router.getCurrentNavigation()?.extras.state;
    this._editar = navState?.flag || false;
    const itemCliente: MtrClienteDireccionDto = navState?.itemCliente;

    this.usuario = this.gs.GetUsuario();
    this.cargarCondicionesPago();

    this.cotizaService.cotizacion$.subscribe((dat) => {
      if (dat && this._editar) {
        this.appGeneralQuotesGetDto = dat;
        this.mapearDatosCotizacion();
      }
    });

    if (!this._editar) {
      if (itemCliente) {
        this.llenarDatosClienteNuevo(itemCliente);
      } else {
        this.titulo = 'Añadir Cotización';
        this.flagInsert = true;
        this.form.get('idMtrTipoMoneda').setValue(2);
      }
    }
  }

  buildForm() {
    const rifPattern = /^[JGVE]-[0-9]{8}-[0-9]$/;
    this.form = this.formBuilder.group({
      idCliente: ['', [Validators.required, Validators.maxLength(6)]],
      idCondPago: [40, [Validators.required]],
      idContacto: ['', [Validators.required]],
      ordenCompra: [''],
      observaciones: ['', [Validators.maxLength(250)]],
      idDireccionEntregar: [''],
      idDireccionFacturar: [''],
      idMtrTipoMoneda: [2, [Validators.required]],
      fijarPrecioBs: [false],
      rif: ['', [Validators.required, Validators.pattern(rifPattern)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(80)]],
      direccion: ['', [Validators.required, Validators.maxLength(240)]],
      idMunicipio: [0],
      descripcionMunicipio: [''],
    });
  }

  convertToUppercase(controlName: string) {
    const control = this.form.get(controlName);
    if (control && control.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  cargarCondicionesPago() {
    this.condicionesPago
      .GetAllCondicionPago({ codigo: 0 })
      .subscribe((resp) => {
        this.condicionPagoDto = resp.data;
      });
  }

  mapearDatosCotizacion() {
    const dto = this.appGeneralQuotesGetDto;
    console.log('dto', dto);
    this.titulo = 'Editar Cotización';
    this.flagUpdate = true;
    this.habilitarDetallePLus = true;
    this.flagDirEntrega = dto.idCliente !== '000000';
    this._cotizacionTitulo = dto.cotizacion;
    this.nombreCliente = dto.mtrClienteDto?.nombre;
    this.nombreCliente = dto.razonSocial;
    this.nombreContacto = dto.mtrContactosDto?.nombre;
    this.editable = dto.appStatusQuoteGetDto?.editable ?? true;

    this.form.patchValue({
      idCliente: dto.idCliente,
      idCondPago: dto.condicionPagoDto?.codigo,
      idContacto: dto.mtrContactosDto?.idContacto,
      ordenCompra: dto.ordenCompra,
      observaciones: dto.observaciones,
      idDireccionEntregar: dto.idDireccionEntregar,
      idDireccionFacturar: dto.idDireccionFacturar,
      idMtrTipoMoneda: dto.idMtrTipoMoneda,
      fijarPrecioBs: dto.idMtrTipoMoneda === 1,
      rif: dto.rif,
      razonSocial: dto.razonSocial,
      direccion: dto.direccion,
      idMunicipio: dto.idMunicipio,
      descripcionMunicipio: dto.descripcionMunicipio,
    });

    this.cotizaService.direccionFacturarCliente$.next(
      dto.mtrDireccionesFacturarDto,
    );
    this.cotizaService.direccionEntregaCliente$.next(
      dto.mtrDireccionesEntregarDto,
    );
  }

  llenarDatosClienteNuevo(item: MtrClienteDireccionDto) {
    this.titulo = 'Añadir Cotización';
    this.flagInsert = true;
    this.flagDirEntrega = true;
    this.nombreCliente = item.nombreCliente;
    const direccion = this.trimTrailingSpaces(item.direccion);

    this.form.patchValue({
      idCliente: item.codigo,
      idDireccionEntregar: item.id,
      idDireccionFacturar: item.idDireccionCliente,
      rif: item.rifCliente,
      razonSocial: item.nombreCliente,
      direccion,
      idMunicipio: item.municipio,
      descripcionMunicipio: item.nombreMunicipio,
      idMtrTipoMoneda: 2,
      idCondPago: 40,
    });

    this.cotizaService.direccionFacturarCliente$.next(item.direccionClienteObj);
    this.cotizaService.direccionEntregaCliente$.next(item.direccionObj);
  }

  async onBuscarCliente() {
    const modal = await this.modalCtrl.create({
      component: SearchClientePage,
      componentProps: { userConectado: this.usuario.user },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      const direccionSeleccionada = data.mtrDireccionesDto || null;
      const direccion = this.trimTrailingSpaces(direccionSeleccionada?.direccion);

      this.nombreCliente = data.nombreCliente;
      this.flagDirEntrega = data.clienteSeleccionado !== '000000';
      console.log('datos retornados por el modal', data);
      this.form.patchValue({
        idCliente: data.clienteSeleccionado,
        rif: data.rif,
        razonSocial: data.nombreCliente,
        direccion,
        idDireccionFacturar: data.idDireccion,
        idDireccionEntregar: data.idDireccion,
      });
      this.cotizaService.direccionFacturarCliente$.next(direccionSeleccionada);
      this.cotizaService.direccionEntregaCliente$.next(direccionSeleccionada);
    }
  }

  async onBuscarMunicipio() {
    const modal = await this.modalCtrl.create({
      component: BuscadorMunicipioComponent,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.itemMunicipio) {
      this.form.patchValue({
        idMunicipio: data.itemMunicipio.recnum,
        descripcionMunicipio: data.itemMunicipio.descMunicipio,
      });
    }
  }

  async onBuscarIdDireccionEntrega() {
    const modal = await this.modalCtrl.create({
      component: DireccionListPage,
      componentProps: {
        idCliente: this.form.get('idCliente').value,
        userConectado: this.usuario.user,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.direccionEntregaCliente) {
      this.form
        .get('idDireccionEntregar')
        .setValue(data.direccionEntregaCliente.id);
      this.cotizaService.direccionEntregaCliente$.next(
        data.direccionEntregaCliente,
      );
    }
  }

  async onAddContacto() {
    const clienteRif: ClienteRif = {
      cliente: this.form.get('idCliente').value,
      rif: this.form.get('rif').value,
    };
    const modal = await this.modalCtrl.create({
      //component: SearchContactosPage,
      component: ContactosListPage,
      componentProps: {
        clienteRif: clienteRif, // <--- Esta llave debe llamarse igual que el @Input()
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.nombreContacto = data.nombreContacto;
      this.form.get('idContacto').setValue(data.idContacto);
    }
  }

  insertCotizacion() {
    console.log('this.form.value', this.form.value);
    if (!this.validarMunicipio()) return;
    this._guardando = true;
    this.cotizaService
      .InsertGeneralCotizacion({
        ...this.form.value,
        usuarioActualiza: this.usuario.user,
      })
      .subscribe({
        next: (res) => {
          if (res.meta.isValid) {
            this.openToast(res.meta.message, 'success');
            this.appGeneralQuotesGetDto = res.data;
            this.cotizaService.cotizacion$.next(res.data);
            this.habilitarDetallePLus = true;
            this.flagInsert = false;
            this.flagUpdate = true;
            this._editar = true;
            this._cotizacionTitulo = res.data?.cotizacion || '';
            this.editable = res.data?.appStatusQuoteGetDto?.editable ?? true;
          } else {
            this.handleCotizacionErrorMessage(res.meta.message);
          }
          this._guardando = false;
        },
        error: (err) => {
          this._guardando = false;
          this.handleCotizacionErrorMessage(
            this.resolveCotizacionErrorMessage(err, 'Error de conexión'),
          );
        },
      });
  }

  UpdateCotizacion() {
    if (!this.validarMunicipio()) return;
    this._guardando = true;
    const updateDto = {
      ...this.form.value,
      id: this.appGeneralQuotesGetDto.id,
      cotizacion: this.appGeneralQuotesGetDto.cotizacion,
      usuarioActualiza: this.usuario.user,
    };

    this.cotizaService.UpdateGeneralCotizacion(updateDto).subscribe({
      next: (res) => {
        if (res.meta.isValid) {
          this.openToast(res.meta.message, 'success');
          this.appGeneralQuotesGetDto = res.data;
          this.cotizaService.cotizacion$.next(res.data);
        } else {
          this.handleCotizacionErrorMessage(res.meta.message);
        }
        this._guardando = false;
      },
      error: (err) => {
        this._guardando = false;
        this.handleCotizacionErrorMessage(
          this.resolveCotizacionErrorMessage(err, 'Error de servidor'),
        );
      },
    });
  }

  private resolveCotizacionErrorMessage(err: any, fallback: string): string {
    return err?.error?.meta?.message || err?.error?.message || err?.message || fallback;
  }

  private handleCotizacionErrorMessage(message: string): void {
    const normalizedMessage = this.normalizeMessage(message);
    this.openToast(message, 'danger');
    if (!this.isRifAssignedToAnotherVendorMessage(normalizedMessage)) return;

    this.openConsultaPorRifModal();
  }

  openConsultaPorRifModal(): void {
    this.consultaRifModalValue = this.form.get('rif')?.value || '';
    this.consultaRifModalOpen = true;
  }

  closeConsultaPorRifModal(): void {
    this.consultaRifModalOpen = false;
  }

  private normalizeMessage(message: unknown): string {
    return (message || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private isRifAssignedToAnotherVendorMessage(message: string): boolean {
    return rifAssignedToAnotherVendorKeywords.every((keyword) =>
      message.includes(keyword),
    );
  }

  private trimTrailingSpaces(value: unknown): string {
    return (value || '').toString().replace(/\s+$/g, '');
  }

  validarMunicipio(): boolean {
    if (!this.flagDirEntrega && this.form.get('idMunicipio').value <= 0) {
      this.openToast('Por favor indique el Municipio', 'danger');
      return false;
    }
    return true;
  }

  onChangeMoneda(event: any) {
    this.form.get('fijarPrecioBs').setValue(event.detail.value === 1);
  }

  ListDetalleCotizacion() {
    const detalles = this.appGeneralQuotesGetDto.appDetailQuotesGetDto || [];
    const item = detalles[0];

    this.cotizaService.cotizacion$.next(this.appGeneralQuotesGetDto);
    this.router.navigate(['edit-detalle-cotizacion'], {
      state: {
        cotizacion: this.appGeneralQuotesGetDto,
        item,
        operacion: item ? 1 : 0,
      },
    });
  }

  async openToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    toast.present();
  }

  get rifFieldIsInvalid() {
    const field = this.form.get('rif');
    return field.touched && field.invalid;
  }

  save(event) {
    event.preventDefault();
  }
}
