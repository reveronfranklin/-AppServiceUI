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

    this.form.patchValue({
      idCliente: item.codigo,
      idDireccionEntregar: item.id,
      idDireccionFacturar: item.idDireccionCliente,
      rif: item.rifCliente,
      razonSocial: item.nombreCliente,
      direccion: item.direccion,
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
      this.nombreCliente = data.nombreCliente;
      this.flagDirEntrega = data.clienteSeleccionado !== '000000';
      console.log('datos retornados por el modal', data);
      this.form.patchValue({
        idCliente: data.clienteSeleccionado,
        rif: data.rif,
        razonSocial: data.nombreCliente,
        direccion: data.mtrDireccionesDto?.direccion,
        idDireccionFacturar: data.idDireccion,
        idDireccionEntregar: data.idDireccion,
      });
      this.cotizaService.direccionFacturarCliente$.next(data.mtrDireccionesDto);
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
            this.cotizaService.cotizacion$.next(res.data);
            this.habilitarDetallePLus = true;
            this.flagInsert = false;
            this.flagUpdate = true;
          } else {
            this.openToast(res.meta.message, 'danger');
          }
          this._guardando = false;
        },
        error: () => {
          this._guardando = false;
          this.openToast('Error de conexión', 'danger');
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
          this.cotizaService.cotizacion$.next(res.data);
        } else {
          this.openToast(res.meta.message, 'danger');
        }
        this._guardando = false;
      },
      error: () => {
        this._guardando = false;
        this.openToast('Error de servidor', 'danger');
      },
    });
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
    this.router.navigate(['menu/list-detalle-cotizacion']);
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
