import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { GeneralService } from 'src/app/services/general.service';

import { CotizacionesListService } from '../../../../services/cotizaciones/cotizaciones-list.service';

import { cotizacionesListDto } from '../../../../models/cotizaciones-list-dto';
import { AppGeneralQuotesGetDto } from '../../../../models/app-general-quotes-get-dto';

import { AppDetailQuotesGetDto } from '../../../../models/app-detail-quotes-get-dto';
import { AppDetailQuotesDeleteDto } from '../../../../models/app-detail-quotes-delete-dto';

import { AppOrdenProductoRepeticionFilterDto } from 'src/app/interfaces/app-orden-producto-repeticion-filter';
import { RepeticionesService } from 'src/app/services/repeticiones.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  listCotizaciones: cotizacionesListDto[] = [];
  cotizacion = new AppGeneralQuotesGetDto();

  detalleItem: AppDetailQuotesGetDto = new AppDetailQuotesGetDto();

  detalleItems: AppDetailQuotesGetDto[] = [];
  repeticionesFilter: AppOrdenProductoRepeticionFilterDto;
  appDetailQuotesDeleteDto: AppDetailQuotesDeleteDto =
    new AppDetailQuotesDeleteDto();

  data: any;
  public showLoading;
  constructor(
    private ar: ActivatedRoute,
    private router: Router,
    private ac: AlertController,
    public gs: GeneralService,
    private navCtrl: NavController,
    private toastController: ToastController,
    public cotizacionesService: CotizacionesListService,
    private actionSheetCtrl: ActionSheetController,
    private repeticionesService: RepeticionesService,
  ) {}

  ngOnInit() {
    this.showLoading = false;
    this.cotizacionesService.cotizacion$.subscribe((cot) => {
      this.cotizacion = cot;
      console.log(
        'cotizacion recuperada del estado el List Detail:',
        this.cotizacion,
      );
    });
    if (!this.cotizacion.appDetailQuotesGetDto) {
      this.cotizacion.permiteAdicionarDetalle = true;
    }
  }

  ionViewDidEnter() {
    this.showLoading = true;
    this.cotizacionesService.cotizacion$.subscribe((dat) => {
      this.cotizacion = dat;

      if (!this.cotizacion.appDetailQuotesGetDto) {
        this.cotizacion.permiteAdicionarDetalle = true;
      }

      this.detalleItems = this.cotizacion.appDetailQuotesGetDto;
      console.log(
        'cotizacion detalleItems recibido',
        this.cotizacion.appDetailQuotesGetDto,
      );
      console.log('detalleItems recibido', this.detalleItems);
      console.log('cotizacion', this.cotizacion);
      this.repeticionesFilter = {
        idCliente: this.cotizacion.idCliente, //this.searchText
      };
      console.log('this.repeticionesFilter', this.repeticionesFilter);
      this.repeticionesService
        .GetAllRepeticiones(this.repeticionesFilter)
        .subscribe((result) => {
          console.log(
            'result de lista repeticiones: result.data ',
            result.data,
          );
        });

      this.showLoading = false;
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

  // AÃ±adir item a la cotizacion
  add() {
    //objeto item de detalle vacio
    const item: AppDetailQuotesGetDto = new AppDetailQuotesGetDto();

    item.statusAprobacionDto = {
      flagAprobado: true,
      flagCerrado: false,
      valorVentaAprobar: 0,
      valorVentaAprobarUsd: 0,
      aprobado: true,
      color: 'prymary',
      statusString: 'APROBADO',
      precioEstimacion: 0,
    };

    //voy al formulario de edicion
    this.router.navigate(['edit-detalle-cotizacion'], {
      state: { cotizacion: this.cotizacion, item, operacion: 0 },
    }); //1 crear
  }

  // edita un item de la cotizacion
  edit(itemRecibido: AppDetailQuotesGetDto) {
    console.log('item en en enviado al detalle>>>>>>+++++', itemRecibido);

    //voy al formulario de edicion
    this.router.navigate(['edit-detalle-cotizacion'], {
      state: {
        item: itemRecibido,
        operacion: 1,
        producto: itemRecibido.appProductsGetDto,
      },
    }); //1 edit
  }

  //eliminar item
  async remove(item) {
    const alert = await this.ac.create({
      cssClass: 'my-custom-class',
      header: 'Eliminar producto',
      subHeader: '',
      message: 'Desea eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.appDetailQuotesDeleteDto.id = item.id;
            this.appDetailQuotesDeleteDto.cotizacion = item.cotizacion;
            console.log(
              'this.appDetailQuotesDeleteDto',
              this.appDetailQuotesDeleteDto,
            );

            this.cotizacionesService
              .DeleteDetalleCotizacion(this.appDetailQuotesDeleteDto)
              .subscribe((result) => {
                console.log('result', result);
                this.cotizacion = result.data;
                this.cotizacionesService.cotizacion$.next(this.cotizacion);
                if (result.meta.isValid === true) {
                  this.openToast(result.meta.message, 'success');
                } else {
                  this.openToast(result.meta.message, 'danger');
                }
              });
          },
        },
      ],
    });

    await alert.present();
  }

  //BACKTO general de cotizaciones
  goGeneral() {
    this.router.navigate(['/menu/cotizacion-edit'], { state: {} });
  }

  async presentActionSheet(item: AppDetailQuotesGetDto) {
    console.log('presentActionSheet', item);
    const actionSheet = this.actionSheetCtrl.create({
      header: 'Acciones...',
      buttons: [
        {
          text: 'Actualizar',
          icon: 'create-outline',
          handler: () => {
            console.log('Actualizar item ', item);
            this.edit(item);
          },
        },
        {
          text: 'Eliminar',
          icon: 'trash',
          handler: () => {
            this.remove(item);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    (await actionSheet).present();
  }
}
