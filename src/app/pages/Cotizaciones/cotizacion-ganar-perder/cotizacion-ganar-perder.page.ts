import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CotizacionesListService } from 'src/app/services/cotizaciones/cotizaciones-list.service';
import { AppGeneralQuotesGetDto } from '../../../models/app-general-quotes-get-dto';
import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { ModalController, ToastController } from '@ionic/angular';

import { CotizacionGanarPerderEditPage } from '../cotizacion-ganar-perder/cotizacion-ganar-perder-edit/cotizacion-ganar-perder-edit.page';
import { GeneralService } from '../../../services/general.service';
import { IUsuario } from '../../../interfaces/iusuario';
import { AppGeneralQuotesQueryFilter } from '../../../interfaces/App-General-Quotes-Query-Filter';
@Component({
  selector: 'app-cotizacion-ganar-perder',
  templateUrl: './cotizacion-ganar-perder.page.html',
  styleUrls: ['./cotizacion-ganar-perder.page.scss'],
})
export class CotizacionGanarPerderPage implements OnInit {
  public cotizacion: AppGeneralQuotesGetDto;
  public appDetailQuotesGetDto: AppDetailQuotesGetDto[] = [];
  public mensaje: string;

  usuario: IUsuario;
  appGeneralQuotesQueryFilter: AppGeneralQuotesQueryFilter;
  fechaDesde: string;
  fechaHasta: string;
  constructor(
    private router: Router,
    private cotizacionesService: CotizacionesListService,
    private modalCtrl: ModalController,
    private gs: GeneralService,
    public toastController: ToastController,
  ) {}

  ngOnInit() {
    this.mensaje = '';
    this.cotizacionesService.cotizacion$.subscribe((resp) => {
      this.cotizacion = resp;
      /* if (this.cotizacion.idCliente === '000000') {
        this.mensaje =
          'Esta cotizacion contiene un cliente Prospecto,Debe asignarun cliente establecido';
      }*/
      console.log('this.cotizacion', this.cotizacion);
      this.appDetailQuotesGetDto = this.cotizacion.appDetailQuotesGetDto.filter(
        (x) => x.idEstatus <= 2,
      );
      console.log(
        'this.cotizacion.appDetailQuotesGetDto',
        this.cotizacion.appDetailQuotesGetDto,
      );
      console.log(
        'En el onini this.appDetailQuotesGetDto',
        this.appDetailQuotesGetDto,
      );
      if (
        this.appDetailQuotesGetDto != null &&
        this.appDetailQuotesGetDto.length > 0
      ) {
        if (
          this.appDetailQuotesGetDto[0].tieneTintasCargadas != null &&
          !this.appDetailQuotesGetDto[0].tieneTintasCargadas
        ) {
          this.mensaje = 'Debe completar las tintas del producto';
        }
      }
    });
  }

  async buscarCotizacion(cotizacion: string) {
    const currentDate = new Date();

    // add a day
    currentDate.setDate(currentDate.getDate() - 30);
    this.fechaDesde = currentDate.toISOString();
    this.fechaHasta = new Date().toISOString();

    this.appGeneralQuotesQueryFilter = {
      pageSize: 100,
      pageNumber: 1,
      usuarioConectado: this.usuario.user,
      cotizacion: cotizacion,
      searchText: '',
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta, //this.searchText
    };

    this.cotizacionesService
      .GetAllGeneralCotizacion(this.appGeneralQuotesQueryFilter)
      .subscribe((listCotizacionesResult) => {
        console.log(
          'Lista de cotizaciones listCotizacionesResult buscarCotizacion: ',
          listCotizacionesResult,
        );
        this.cotizacionesService.allCotizaciones$.next(
          listCotizacionesResult.data,
        );
        this.appDetailQuotesGetDto =
          listCotizacionesResult.data[0].appDetailQuotesGetDto;
      });
  }

  async ionViewDidEnter() {
    this.usuario = this.gs.GetUsuario();

    await this.buscarCotizacion(this.cotizacion.cotizacion);
    this.mensaje = '';
    this.cotizacionesService.cotizacion$.subscribe((resp) => {
      this.cotizacion = resp;

      /*if (this.cotizacion.idCliente === '000000') {
        this.mensaje =
          'Esta cotizacion contiene un cliente Prospecto,Debe asignar un cliente establecido';
      }*/

      this.appDetailQuotesGetDto = this.cotizacion.appDetailQuotesGetDto.filter(
        (x) => x.idEstatus <= 2,
      );
      //console.log('En el onini this.appDetailQuotesGetDto', this.appDetailQuotesGetDto);

      if (
        this.appDetailQuotesGetDto != null &&
        this.appDetailQuotesGetDto.length > 0
      ) {
        if (
          this.appDetailQuotesGetDto[0].tieneTintasCargadas != null &&
          !this.appDetailQuotesGetDto[0].tieneTintasCargadas &&
          this.appDetailQuotesGetDto[0].appProductsGetDto.appSubCategoryId != 2
        ) {
          this.mensaje = 'Debe completar las tintas del producto';
        }
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

  async editItem(item: AppDetailQuotesGetDto) {
    const modal = await this.modalCtrl.create({
      component: CotizacionGanarPerderEditPage,
      componentProps: {
        item,
      },
    });

    await modal.present();
    const retorno = await modal.onDidDismiss();
    this.goListCotizacion(item);
  }
  goListCotizacion(item) {
    //{ state: { item: this.cotizacion } }

    this.refreshCotizacion(item.cotizacion);
  }
  refreshCotizacion(cotizacion: string) {
    this.mensaje = '';
    this.usuario = this.gs.GetUsuario();

    this.appGeneralQuotesQueryFilter = {
      pageSize: 0,
      pageNumber: 1,
      usuarioConectado: this.usuario.user,
      cotizacion: '',
      searchText: cotizacion, //this.searchText
    };
    this.usuario = this.gs.GetUsuario();
    this.cotizacionesService
      .GetAllGeneralCotizacion(this.appGeneralQuotesQueryFilter)
      .subscribe((listCotizacionesResult) => {
        console.log(
          'Lista de cotizaciones en ganar oerder listCotizacionesResult buscarCotizacion: ',
          listCotizacionesResult,
        );
        this.cotizacionesService.allCotizaciones$.next(
          listCotizacionesResult.data,
        );
        this.cotizacion = listCotizacionesResult.data[0];
        this.appDetailQuotesGetDto =
          this.cotizacion.appDetailQuotesGetDto.filter(
            (x) => x.idEstatus === 2,
          );
        /*if (this.cotizacion.idCliente === '000000') {
          this.mensaje =
            'Esta cotizacion contiene un cliente Prospecto,Debe asignar un cliente establecido';
        }*/

        if (
          this.appDetailQuotesGetDto === null ||
          this.appDetailQuotesGetDto.length === 0
        ) {
          this.router.navigate(['/menu/cotizaciones-list'], {});
        }
      });
  }
}
