import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavParams } from '@ionic/angular';
import { AppStatusQuoteGetDto } from 'src/app/models/app-status-quote-get-dto';
import { CotizacionesListService } from 'src/app/services/cotizaciones/cotizaciones-list.service';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { AppGeneralQuotesGetDto } from '../../../../models/app-general-quotes-get-dto';
import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { AppMotivoQueryFilter } from 'src/app/interfaces/app-motivo-query-filter';
import { AppMotivoGetDto } from 'src/app/models/app-motivo-get-dto';
import { BuscadorCompetidorPage } from '../../cotizacion-ganar-perder/buscador-competidor/buscador-competidor.page';
import { AppGanarPerderUpdateDto } from 'src/app/models/app-ganar-perder-update-dto';
import { IUsuario } from '../../../../interfaces/iusuario';
import { GeneralService } from '../../../../services/general.service';
import { ReturnStatement } from '@angular/compiler';

@Component({
  selector: 'app-cotizacion-ganar-perder-edit',
  templateUrl: './cotizacion-ganar-perder-edit.page.html',
  styleUrls: ['./cotizacion-ganar-perder-edit.page.scss'],
})
export class CotizacionGanarPerderEditPage implements OnInit {
  public cotizacion: AppGeneralQuotesGetDto;
  public appStatusQuoteGetDto: AppStatusQuoteGetDto;
  public appDetailQuotesGetDto: AppDetailQuotesGetDto[] = [];
  public itemDetail: AppDetailQuotesGetDto;
  public appMotivoQueryFilter: AppMotivoQueryFilter =
    new AppMotivoQueryFilter();
  public appMotivoGetDto: AppMotivoGetDto[] = [];
  public appGanarPerderUpdateDto: AppGanarPerderUpdateDto =
    new AppGanarPerderUpdateDto();

  form: FormGroup;
  public guardando: boolean;

  public usuario: string;
  public mensajeError: string;
  constructor(
    private router: Router,
    private cotizacionesService: CotizacionesListService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    public toastController: ToastController,
    private navParams: NavParams,
    private generalService: GeneralService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.guardando = false;
    this.usuario = this.generalService.GetUsuario().user;
    this.itemDetail = this.navParams.get('item');

    this.cotizacionesService.cotizacion$.subscribe((resp) => {
      this.cotizacion = resp;
      this.appStatusQuoteGetDto = resp.appStatusQuoteGetDto;
      this.appDetailQuotesGetDto = this.cotizacion.appDetailQuotesGetDto;

      this.form.get('vendedor').setValue(this.cotizacion.mtrVendedorDto.nombre);
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      vendedor: ['', [Validators.required]],
      competidor: ['', [Validators.required]],
      motivoId: ['', [Validators.required]],
      condicionId: [''],
    });
  }

  onChangeStatus(event) {
    this.appMotivoQueryFilter.Condicion = event.target.value;
    console.log(this.appMotivoQueryFilter);
    this.cotizacionesService
      .GetAllMotivoGanarPerder(this.appMotivoQueryFilter)
      .subscribe((result) => {
        this.appMotivoGetDto = result.data;
      });
  }

  async onBuscarIdCompetidor() {
    const modal = await this.modalCtrl.create({
      component: BuscadorCompetidorPage,
      componentProps: {},
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    this.form.get('competidor').setValue(data.competidor.nombre);

    this.appGanarPerderUpdateDto.competidorId = data.competidor.codCompetidor;
  }

  ganarPerder() {
    this.appGanarPerderUpdateDto.appDetailQuotesId = this.itemDetail.id;
    // this.appGanarPerderUpdateDto.competidorId=... // SE ACTUALIZA AL SELECCIONAR EL COMPETIDOR
    this.appGanarPerderUpdateDto.condicionId =
      this.form.controls['condicionId'].value;
    this.appGanarPerderUpdateDto.motivoId =
      this.form.controls['motivoId'].value;
    this.appGanarPerderUpdateDto.UsuarioConectado = this.usuario;
    console.log(
      'objeto a enviar en ganar perder:',
      this.appGanarPerderUpdateDto
    );

    if (
      this.itemDetail.tieneTintasCargadas === false &&
      this.appGanarPerderUpdateDto.condicionId != 2
    ) {
      this.openToast('Debe completar las tintas del producto', 'danger');
      return;
    }
    this.guardando = true;

    this.cotizacionesService
      .UpdateGanarPerder(this.appGanarPerderUpdateDto)
      .subscribe((result) => {
        console.log(result);

        if (result.meta.isValid === true) {
          this.openToast(result.meta.message, 'success');
          this.guardando = false;
          this.dismiss();
        } else {
          this.openToast(result.meta.message, 'danger');
          this.guardando = false;
        }
      });
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

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
