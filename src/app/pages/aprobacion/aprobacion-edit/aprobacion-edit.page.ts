/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import {
  ActionSheetController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { SearchClientePage } from '../../clientes/search-cliente/search-cliente.page';
import { CotizacionesListService } from '../../../services/cotizaciones/cotizaciones-list.service';
import { IUsuario } from 'src/app/interfaces/iusuario';
import { GeneralService } from 'src/app/services/general.service';
import { AppGeneralQuotesCreateDto } from '../../../models/app-general-quotes-create-dto';
import { CondicionPagoQueryFilter } from 'src/app/interfaces/condicion-pago-query-filter';
import { CondicionPagoDto } from '../../../models/CondicionPagoDto';
import { SearchContactosPage } from '../../clientes/search-contactos/search-contactos.page';
import { DireccionListPage } from '../../direcciones/direccion-list/direccion-list.page';
import { MtrDireccionesDto } from 'src/app/models/mtr-direcciones-dto';
import { AppGeneralQuotesGetDto } from '../../../models/app-general-quotes-get-dto';
import { AppGeneralQuotesUpdateDto } from '../../../models/app-general-quotes-update-dto';
import { MtrTipoMonedaDto } from 'src/app/models/mtr-tipo-moneda-dto';
import { AppGeneralQuotesQueryFilter } from 'src/app/interfaces/App-General-Quotes-Query-Filter';
import { ContactosListPage } from '../../contactos/contactos-list/contactos-list.page';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteRif } from '../../../models/cliente-rif';
import { BuscadorMunicipioComponent } from '../../../components/buscador-municipio/buscador-municipio.component';
import { MunicipioGetDto } from '../../../models/municipio-get-dto';
import { MtrSectorDto } from 'src/app/models/mtr-sector-dto';

import { MtrClienteDireccionDto } from 'src/app/models/mtr-direcciones-clientes-dto';
import { BuscadorRamoComponent } from 'src/app/components/buscador-ramo/buscador-ramo.component';
import { BuscadorSectorComponent } from 'src/app/components/buscador-sector/buscador-sector.component';
import { MtrRamoDto } from 'src/app/models/mtr-ramo-dto';
import { MtrTipoNegocioDto } from 'src/app/models/mtr-tipo-negocio-dto';
import { MtrClienteDireccionUpdateDto } from 'src/app/models/mtr-cliente-direccion-update-dto';
import { CotizacionesPorAprobarGetDto } from 'src/app/models/CotizacionesPorAprobarGetDto';
import { SearchEstadoCuentaPage } from '../../EstadoCuenta/search-estado-cuenta/search-estado-cuenta.page';
import * as moment from 'moment';
import { ActualizarCotizacion } from 'src/app/interfaces/Aprobaciones/ActualizarCotizacion';

@Component({
  selector: 'app-aprobacion-edit',
  templateUrl: './aprobacion-edit.page.html',
  styleUrls: ['./aprobacion-edit.page.scss'],
})
export class AprobacionEditPage implements OnInit {
  @Input() itemAprobacion: CotizacionesPorAprobarGetDto;
  get rifField() {
    return this.form.get('rifDireccion');
  }

  get rifFieldIsValid() {
    return this.rifField.touched && this.rifField.valid;
  }

  get rifFieldIsInvalid() {
    return this.rifField.touched && this.rifField.invalid;
  }

  public showLoading: boolean;
  rifPattern: string;
  titulo: string;
  flagInsert: boolean;
  flagUpdate: boolean;

  usuario: IUsuario;
  form: FormGroup;
  codigo: string;
  rif: string;
  nombreCliente: string;
  condicionPagoQueryFilter: CondicionPagoQueryFilter;
  clienteRif: ClienteRif = new ClienteRif();
  condicionPagoDto: CondicionPagoDto;
  mensaje: string;
  tasa: number;
  sectorSeleccionado: MtrSectorDto;
  ramoSeleccionado: MtrRamoDto;
  appGeneralQuotesQueryFilter: AppGeneralQuotesQueryFilter;

  fechaPago: string;
  fechaPagoFormated: string;
  showPicker: boolean;

  pageSize = 20;
  page = 0;

  guardando: boolean;
  cargando: boolean;
  listTipoNegocio: MtrTipoNegocioDto[];

  basePath: string;
  accionPath: string;
  controller: string;
  link: string;

  constructor(
    private formBuilder: FormBuilder,
    private cotizaService: CotizacionesListService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private gs: GeneralService,
    public toastController: ToastController,
    private navCtrl: NavController,
    private clienteService: ClienteService,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.basePath = gs.basePath;
    this.controller = 'AppReport/';
    this.accionPath = 'GetCotizacion';
    this.buildForm();
  }

  ngOnInit() {
    this.fechaPagoFormated = '';
    console.log('itemAprobacion recibido', this.itemAprobacion);
    this.cargando = true;
    this.usuario = this.gs.GetUsuario();
    this.titulo = 'Aprobar Cotizacion';
    this.form.get('cotizacion').setValue(this.itemAprobacion.cotizacion);
    this.form.get('renglon').setValue(this.itemAprobacion.renglon);
    this.form.get('idCliente').setValue(this.itemAprobacion.idCliente);
    this.form.get('razonSocial').setValue(this.itemAprobacion.razonSocial);
    this.form.get('producto').setValue(this.itemAprobacion.producto);
    this.form
      .get('codigoProducto')
      .setValue(this.itemAprobacion.codigoProducto);
    this.form.get('vendedor').setValue(this.itemAprobacion.vendedor);
    this.form.get('fechaString').setValue(this.itemAprobacion.fechaString);
    this.form.get('oficina').setValue(this.itemAprobacion.oficina);
    this.form.get('nombreOficina').setValue(this.itemAprobacion.nombreOficina);
    this.form
      .get('totalPropuestaUsd')
      .setValue(this.itemAprobacion.totalPropuestaUsd);
    this.form
      .get('obsSolicitudPrecio')
      .setValue(this.itemAprobacion.obsSolicitudPrecio);

    if (this.itemAprobacion.tasaExcepcion === undefined) {
      this.form.get('tasaExcepcion').setValue(0);
    } else {
      this.form
        .get('tasaExcepcion')
        .setValue(this.itemAprobacion.tasaExcepcion);
    }
    this.tasa = this.itemAprobacion.tasaExcepcion;

    if (this.itemAprobacion.imprimirFacturaEnUSD === undefined) {
      this.form.get('imprimirFacturaEnUSD').setValue(false);
    } else {
      this.form
        .get('imprimirFacturaEnUSD')
        .setValue(this.itemAprobacion.imprimirFacturaEnUSD);
    }

    this.form.get('fechaPagoString').setValue(this.itemAprobacion.fechaPago);
    this.fechaPagoFormated = moment(this.itemAprobacion.fechaPago).format(
      'DD/MM/YYYY'
    );
    this.form
      .get('imprimirFacturaEnUSD')
      .setValue(this.itemAprobacion.imprimirFacturaEnUSD);
  }

  buildForm() {
    this.rifPattern = '[JGVE][-][0-9]{8}[-][0-9]';
    this.form = this.formBuilder.group({
      cotizacion: [0, []],
      renglon: ['', []],
      idCliente: ['', []],
      razonSocial: ['', []],
      producto: ['', []],
      codigoProducto: ['', []],
      vendedor: [''],
      fechaString: ['', []],
      oficina: ['', []],
      nombreOficina: ['', []],
      totalPropuestaUsd: ['', []],
      obsSolicitudPrecio: ['', []],
      idSolicitudPrecio: ['', []],
      tasaExcepcion: [0, []],
      fechaPagoString: ['', []],
      imprimirFacturaEnUSD: [false, []],
    });
  }

  onChangeFechaPago(event) {
    console.log(event.detail.value);
    this.fechaPago = event.detail.value;
    this.form.get('fechaPagoString').setValue(this.fechaPago);
    this.form.get('fechaString').setValue(this.itemAprobacion.fechaString);
    this.fechaPagoFormated = moment(event.detail.value).format('DD/MM/YYYY');
    this.showPicker = false;
    console.log(this.fechaPago);
  }

  onChangeTasa(event) {
    console.log('tasa',event.detail.value);
    this.tasa = event.detail.value;
  }

  onChangeNegocio(event) {
    console.log('En onChangeNegocio, event.detail.value tiene el valor:');
    console.log(event.detail.value);
  }
  async openToast(message, color) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color,
    });
    toast.present();
  }
  async onBuscarDocumento() {
    const modal = await this.modalCtrl.create({
      component: SearchEstadoCuentaPage,
      componentProps: {
        cliente: this.itemAprobacion.idCliente,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
  }

  async onBuscarSector() {
    const modal = await this.modalCtrl.create({
      component: BuscadorSectorComponent,
      componentProps: {
        userConectado: this.usuario.user,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    this.form.get('sector').setValue(data.itemSector.sector);
    this.form
      .get('descripcionSector')
      .setValue(data.itemSector.descripcionSector);
    this.sectorSeleccionado = data.itemSector;
  }
  async onBuscarRamo() {
    const modal = await this.modalCtrl.create({
      component: BuscadorRamoComponent,
      componentProps: {
        listAllRamos: this.sectorSeleccionado.ramo,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    this.form.get('ramo').setValue(data.itemRamo.ramo);
    this.form.get('descripcionRamo').setValue(data.itemRamo.descripcionRamo);
    this.ramoSeleccionado = data.itemRamo;
  }
  async onBuscarMunicipio() {
    const modal = await this.modalCtrl.create({
      component: BuscadorMunicipioComponent,
      componentProps: {
        userConectado: this.usuario.user,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    this.form.get('municipio').setValue(data.itemMunicipio.codigoMcpo);
    this.form.get('estado').setValue(data.itemMunicipio.codigoEstado);
    this.form
      .get('descripcionMunicipio')
      .setValue(data.itemMunicipio.descMunicipio);
  }

  openLink() {
    console.log('al entrar en openLink');
    console.log('this.basePath', this.basePath);
    console.log('this.controller', this.controller);
    console.log('this.accionPath', this.accionPath);
    const baseLink = this.basePath + this.controller + this.accionPath;
    console.log('baseLink', baseLink);

    //this.link = 'https://mooreapps.com.ve/AppServiceBack/api/AppReport/GetCotizacion/' +
    this.link =
      baseLink +
      '/' +
      this.form.controls['cotizacion'].value +
      '/' +
      false +
      '/' +
      false +
      '/' +
      false +
      '/' +
      true +
      '/' +
      true +
      '/' +
      this.itemAprobacion.appSubCategoryId;
    console.log('Ling  de imprimir cotizacion', this.link);
    // window.open(this.link, '_blank');
    window.open(this.link, '_parent', 'download');
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async onBuscarCliente() {
    const modal = await this.modalCtrl.create({
      component: SearchClientePage,
      componentProps: {
        userConectado: this.usuario.user,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    this.codigo = data.clienteSeleccionado;
    this.nombreCliente = data.nombreCliente;

    this.form.get('idCliente').setValue(data.clienteSeleccionado);
    this.form.get('razonSocial').setValue(data.nombreCliente);
  }

  update() {
    this.showLoading = true;
    const updateDto: ActualizarCotizacion = {
      cotizacion: this.form.controls['cotizacion'].value,
      tasaExcepcion: this.form.controls['tasaExcepcion'].value,
      fechaPago: this.form.controls['fechaPagoString'].value,
      imprimirFacturaEnUSD: this.form.controls['imprimirFacturaEnUSD'].value,
      idCliente: this.form.controls['idCliente'].value,
      usuarioConectado: this.usuario.user,
      renglon: this.itemAprobacion.renglon,
      propuesta: this.itemAprobacion.propuesta,

    };
    console.log('Fecha de pago', updateDto.fechaPago);

    console.log(
      'Fecha de pago string',
      this.form.controls['fechaPagoString'].value
    );
    console.log('TAsa', updateDto.tasaExcepcion);
    /*if (
      this.form.controls['tasaExcepcion'].value > 0 &&
      this.form.controls['fechaPagoString'].value === '1900-01-01T00:00:00'
    ) {
      this.openToast('Debe indicar fecha de pago', 'danger');
      return;
    }

    if (
      this.form.controls['tasaExcepcion'].value > 0 &&
      this.form.controls['fechaPagoString'].value === undefined
    ) {
      this.openToast('Debe indicar fecha de pago', 'danger');
      return;
    }*/

    console.log('objeto enviado para guardar direccion updateDto', updateDto);

    this.guardando = true;
    this.clienteService
      .updateTasaFechaPagoCotizacion(updateDto)
      .subscribe((result) => {
        console.log(
          '******el result enviado por la api despues de guardar es:********'
        );
        console.log(result);

        if (result.meta.isValid === true) {
          this.openToast(result.meta.message, 'success');
          this.closeModal();
          this.guardando = false;
          this.showLoading = false;
        } else {
          this.openToast(result.meta.message, 'danger');
          this.guardando = false;
          this.showLoading = false;
        }
      });
  }

  retornar() {
    const filter = {
      cotizacion: this.form.controls['cotizacion'].value,
      usuarioActualiza: this.usuario.user,
      id: 0,
    };

    console.log(filter);
    return;
    this.guardando = true;
    this.clienteService
      .aprobarCotizacionRetornarGrabacion(filter)
      .subscribe((result) => {
        console.log(
          '******el result enviado por la api despues de guardar es:********'
        );
        console.log(result);

        if (result.meta.isValid === true) {
          this.openToast(result.meta.message, 'success');
          this.closeModal();
          this.guardando = false;
        } else {
          this.openToast(result.meta.message, 'danger');
          this.guardando = false;
        }
      });
  }

  public async presentActionSheet(item: CotizacionesPorAprobarGetDto) {
    const opcionesMenu = [];

    const dict = {
      actualizar: {
        text: ' Aprobar',
        icon: 'create-outline',
        handler: () => {
          this.aprobar();
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

  public async presentActionSheetExcepcion(item: CotizacionesPorAprobarGetDto) {
    const opcionesMenu = [];

    const dict = {
      actualizar: {
        text: ' Cerrar Excepcion',
        icon: 'create-outline',
        handler: () => {
          this.cerrarExcepcion();
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


  aprobar() {
    const updateDto: ActualizarCotizacion = {
      cotizacion: this.form.controls['cotizacion'].value,
      tasaExcepcion: this.form.controls['tasaExcepcion'].value,
      fechaPago: this.form.controls['fechaPagoString'].value,
      imprimirFacturaEnUSD: this.form.controls['imprimirFacturaEnUSD'].value,
      usuarioConectado: this.usuario.user,
      renglon: this.itemAprobacion.renglon,
      propuesta: this.itemAprobacion.propuesta,
      idCliente: this.form.controls['idCliente'].value,
    };

    if (
      this.itemAprobacion.fiscal.length > 0 &&
      this.itemAprobacion.tieneRifAdjunto === false
    ) {
      this.openToast('Cotizacion fiscal y no tiene rif adjunto', 'danger');
      return;
    }

    console.log('objeto enviado para aprobar cotizacion updateDto', updateDto);

    this.guardando = true;
    this.clienteService
      .aprobarCotizacionEtlPasePlanta(updateDto)
      .subscribe((result) => {
        console.log(
          '******el result enviado por la api despues de guardar es:********'
        );
        console.log(result);

        if (result.meta.isValid === true) {
          this.openToast(result.meta.message, 'success');
          this.closeModal();
          this.guardando = false;
        } else {
          this.openToast(result.meta.message, 'danger');
          this.guardando = false;
        }
      });
  }

  cerrarExcepcion() {
    const updateDto: ActualizarCotizacion = {
      cotizacion: this.form.controls['cotizacion'].value,
      tasaExcepcion: this.form.controls['tasaExcepcion'].value,
      fechaPago: this.form.controls['fechaPagoString'].value,
      imprimirFacturaEnUSD: this.form.controls['imprimirFacturaEnUSD'].value,
      usuarioConectado: this.usuario.user,
      renglon: this.itemAprobacion.renglon,
      propuesta: this.itemAprobacion.propuesta,
      idCliente: this.form.controls['idCliente'].value,
      solicitudDeCredito: this.itemAprobacion.solicitudDeCredito,
    };


    console.log('objeto enviado para cerrar excepcion cotizacion updateDto', updateDto);

    this.guardando = true;
    this.clienteService
      .cerrarExcepcion(updateDto)
      .subscribe((result) => {
        console.log(
          '******el result enviado por la api despues de guardar es:********'
        );
        console.log(result);

        if (result.meta.isValid === true) {
          this.openToast(result.meta.message, 'success');
          this.closeModal();
          this.guardando = false;
        } else {
          this.openToast(result.meta.message, 'danger');
          this.guardando = false;
        }
      });
  }
}
