/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ModalController, NavController, ToastController } from '@ionic/angular';
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


@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.page.html',
  styleUrls: ['./customer-edit.page.scss'],
})
export class CustomerEditPage implements OnInit {
  @Input() itemCustomer: MtrClienteDireccionDto;
  get rifField() {
    return this.form.get('rifDireccion');
  }

  get rifFieldIsValid() {
    return this.rifField.touched && this.rifField.valid;
  }

  get rifFieldIsInvalid() {
    return this.rifField.touched && this.rifField.invalid;
  }
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

  sectorSeleccionado: MtrSectorDto;
  ramoSeleccionado: MtrRamoDto;
  appGeneralQuotesQueryFilter: AppGeneralQuotesQueryFilter;

  pageSize = 20;
  page = 0;

  guardando: boolean;
  cargando: boolean;
  listTipoNegocio: MtrTipoNegocioDto[];

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
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.listTipoNegocio=[{idTipoNegocio:'1',descripcionTipoNegocio:'PRIVADO'},{idTipoNegocio:'2',descripcionTipoNegocio:'GOBIERNO'}];
    console.log('itemCustomer recibido',this.itemCustomer);
    this.cargando=true;
    this.usuario = this.gs.GetUsuario();
    console.log('Usuario conectado:',this.usuario);
    this.titulo = 'Editar Dirección';
    this.form.get('id').setValue(this.itemCustomer.id);
    this.form.get('idDireccionCliente').setValue(this.itemCustomer.idDireccionCliente);
    this.form.get('codigo').setValue(this.itemCustomer.codigo);
    this.form.get('nombreCliente').setValue(this.itemCustomer.nombreCliente);
    this.form.get('rifCliente').setValue(this.itemCustomer.rifCliente);
    this.form.get('rifDireccion').setValue(this.itemCustomer.rifDireccion);
    this.form.get('sector').setValue(this.itemCustomer.sector);
    this.form.get('descripcionSector').setValue(this.itemCustomer.descripcionSector);
    this.form.get('ramo').setValue(this.itemCustomer.ramo);
    this.form.get('descripcionRamo').setValue(this.itemCustomer.descripcionRamo);


    this.form.get('estado').setValue(this.itemCustomer.estado);
    this.form.get('municipio').setValue(this.itemCustomer.municipio);
    this.form.get('descripcionMunicipio').setValue(this.itemCustomer.descripcionMunicipio);
    this.form.get('descripcionEstado').setValue(this.itemCustomer.descripcionEstado);
    this.form.get('direccion').setValue(this.itemCustomer.direccion);
    this.form.get('direccion1').setValue(this.itemCustomer.direccion1);
    this.form.get('direccion2').setValue(this.itemCustomer.direccion2);
    this.form.get('idTipoNegocio').setValue(this.itemCustomer.idTipoNegocio);
    this.form.get('descripcionTipoNegocio').setValue(this.itemCustomer.descripcionTipoNegocio);
    this.form.get('puntoReferencia').setValue(this.itemCustomer.puntoReferencia);
    this.nombreCliente=this.itemCustomer.nombreCliente;
    this.codigo=this.itemCustomer.codigo;
    this.rif=this.itemCustomer.rifCliente;
    this.sectorSeleccionado=this.itemCustomer.sectorObj;



  }



   buildForm() {
    this.rifPattern = '[JGVE][-][0-9]{8}[-][0-9]';
    this.form = this.formBuilder.group({

      id: [0, [Validators.required,Validators.min(1)]],
      codigo: ['', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]],
      sector: ['',[Validators.required]],
      ramo: ['',[Validators.required]],
      descripcionSector: ['',[Validators.required]],
      descripcionRamo: ['',[Validators.required]],
      idDireccionCliente: [''],
      rifCliente: ['', []],
      rifDireccion: ['', [Validators.pattern(this.rifPattern)]],
      nombreCliente: ['', [Validators.required, Validators.maxLength(80)]],
      direccion: ['', [Validators.required, Validators.maxLength(240)]],
      direccion1: ['', [ Validators.maxLength(240)]],
      direccion2: ['', [Validators.maxLength(240)]],
      idTipoNegocio: ['', []],
      descripcionTipoNegocio: ['', []],
      estado: ['', []],
      municipio: ['', []],
      descripcionMunicipio: ['', []],
      descripcionEstado: ['', []],
      puntoReferencia: ['', []],
    });
  }

  onChangeNegocio(event) {
    console.log('En onChangeNegocio, event.detail.value tiene el valor:');
    console.log(event.detail.value);
    this.form.get('idTipoNegocio').setValue( event.detail.value);

    if ( event.detail.value === '1') {
      this.form.get('descripcionTipoNegocio').setValue('PRIVADO');
    } else {
      this.form.get('descripcionTipoNegocio').setValue('GOBIERNO');
    }

  }
  async openToast(message, color) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color

    });
    toast.present();
  }


  async onBuscarSector() {

    const modal = await this.modalCtrl.create({
      component: BuscadorSectorComponent,
      componentProps: {
        userConectado: this.usuario.user
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('datos retornados por el modal*******', data);
    this.form.get('sector').setValue(data.itemSector.sector);
    this.form.get('descripcionSector').setValue(data.itemSector.descripcionSector);
    this.sectorSeleccionado=data.itemSector;

  }
  async onBuscarRamo() {

    const modal = await this.modalCtrl.create({
      component: BuscadorRamoComponent,
      componentProps: {
        listAllRamos: this.sectorSeleccionado.ramo
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('datos retornados por el modal ramo*******', data);
    this.form.get('ramo').setValue(data.itemRamo.ramo);
    this.form.get('descripcionRamo').setValue(data.itemRamo.descripcionRamo);
    this.ramoSeleccionado=data.itemRamo;

  }
  async onBuscarMunicipio() {

    const modal = await this.modalCtrl.create({
      component: BuscadorMunicipioComponent,
      componentProps: {
        userConectado: this.usuario.user
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('datos retornados por el modal municipio*******', data);
    this.form.get('municipio').setValue(data.itemMunicipio.codigoMcpo);
    this.form.get('estado').setValue(data.itemMunicipio.codigoEstado);
    this.form.get('descripcionMunicipio').setValue(data.itemMunicipio.descMunicipio);

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
  update() {

      if (this.form.controls['codigo'].value <= 0) {
        this.openToast('Codigo Cliente Invalido', 'danger');
        return;

      }
      if (this.form.controls['direccion'].value.length <= 0) {
        this.openToast('Direccion invalida', 'danger');
        return;

      }
      if (this.form.controls['sector'].value.length <= 0) {
        this.openToast('Sector invalido', 'danger');
        return;
      }
      if (this.form.controls['ramo'].value.length <= 0) {
        this.openToast('Ramo invalido', 'danger');
        return;
      }
      if (this.form.controls['descripcionRamo'].value.length <= 0) {
        this.openToast('Ramo invalido', 'danger');
        return;
      }
      if(this.rifFieldIsInvalid){
        this.openToast('Formato de Rif Invalido', 'danger');
        return;
      }
      const updateDto: MtrClienteDireccionUpdateDto=  {
        id:this.form.controls['id'].value,
        codigo: this.form.controls['codigo'].value,
        rifCliente: this.form.controls['rifCliente'].value,
        rifDireccion: this.form.controls['rifDireccion'].value,
        idDireccionCliente:this.form.controls['idDireccionCliente'].value,
        direccion: this.form.controls['direccion'].value,
        direccion1: this.form.controls['direccion1'].value,
        direccion2: this.form.controls['direccion2'].value,
        estado: this.form.controls['estado'].value,
        municipio: this.form.controls['municipio'].value,
        idTipoNegocio: this.form.controls['idTipoNegocio'].value,
        sector: this.form.controls['sector'].value,
        ramo: this.form.controls['ramo'].value,
        puntoReferencia: this.form.controls['puntoReferencia'].value,
        usuario:this.usuario.user,
    };
    console.log('objeto enviado para guardar direccion updateDto',updateDto);
    this.guardando = true;
    this.clienteService.updateClienteDireccion(updateDto).subscribe(result => {

      console.log('******el result enviado por la api despues de guardar es:********');
      console.log(result);

      if (result.meta.isValid === true) {
        this.openToast(result.meta.message, 'success');
        this.closeModal() ;
        this.guardando = false;
      } else {
        this.openToast(result.meta.message, 'danger');
        this.guardando = false;
      }
    });


  }







}
