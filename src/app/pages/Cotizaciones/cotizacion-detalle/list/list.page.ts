import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general.service';

import { CotizacionesListService } from '../../../../services/cotizaciones/cotizaciones-list.service';

import { AppGeneralQuotesGetDto } from '../../../../models/app-general-quotes-get-dto';

import { AppDetailQuotesGetDto } from '../../../../models/app-detail-quotes-get-dto';
import { AppDetailQuotesDeleteDto } from '../../../../models/app-detail-quotes-delete-dto';

import { CotizacionDetalleBusinessRulesService } from 'src/app/services/cotizacion-detalle-business-rules.service';

interface DetalleCotizacionListItem extends AppDetailQuotesGetDto {
  precioBaseConFlete: number;
  porcentajeSobreprecio: number;
  puedeEnviarAprobacionPorSobreprecio: boolean;
  statusAprobacionColor: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit, OnDestroy {
  cotizacion = new AppGeneralQuotesGetDto();

  detalleItems: DetalleCotizacionListItem[] = [];

  public showLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private ac: AlertController,
    public gs: GeneralService,
    private toastController: ToastController,
    public cotizacionesService: CotizacionesListService,
    private actionSheetCtrl: ActionSheetController,
    private detalleBusinessRules: CotizacionDetalleBusinessRulesService,
  ) {}

  ngOnInit() {
    this.showLoading = false;
    this.cotizacionesService.cotizacion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cot) => {
        this.aplicarCotizacion(cot);
      });
  }

  ionViewDidEnter() {
    this.showLoading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private aplicarCotizacion(cotizacion: AppGeneralQuotesGetDto): void {
    this.cotizacion = cotizacion;

    if (!this.cotizacion.appDetailQuotesGetDto) {
      this.cotizacion.permiteAdicionarDetalle = true;
    }

    this.detalleItems = (this.cotizacion.appDetailQuotesGetDto || []).map(
      (item) => this.mapDetalleItem(item),
    );
    this.showLoading = false;
  }

  private mapDetalleItem(
    item: AppDetailQuotesGetDto,
  ): DetalleCotizacionListItem {
    const precioBaseConFlete = this.calcularPrecioBaseConFlete(item);
    const porcentajeSobreprecio = this.detalleBusinessRules.calcularPorcentajeSobreprecio(
      precioBaseConFlete,
      Number(item?.precioUsd || 0),
    );

    return Object.assign(item, {
      precioBaseConFlete,
      porcentajeSobreprecio,
      puedeEnviarAprobacionPorSobreprecio:
        this.detalleBusinessRules.puedeEnviarAprobacionPorSobreprecio(
          precioBaseConFlete,
          Number(item?.precioUsd || 0),
          Number(item?.porcMaximoSobrePrecio || 0),
        ),
      statusAprobacionColor: this.detalleBusinessRules.getColorEstatusAprobacion(
        item?.statusAprobacionDto?.statusString,
      ),
    });
  }

  async openToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  // Agregar item a la cotizacion
  add() {
    //objeto item de detalle vacio
    const item: AppDetailQuotesGetDto = new AppDetailQuotesGetDto();

    item.statusAprobacionDto =
      this.detalleBusinessRules.crearEstadoAprobadoInicial();

    //voy al formulario de edicion
    this.router.navigate(['edit-detalle-cotizacion'], {
      state: { cotizacion: this.cotizacion, item, operacion: 0 },
    }); //1 crear
  }

  // edita un item de la cotizacion
  edit(itemRecibido: AppDetailQuotesGetDto) {
    //voy al formulario de edicion
    this.router.navigate(['edit-detalle-cotizacion'], {
      state: {
        cotizacion: this.cotizacion,
        item: itemRecibido,
        operacion: 1,
        producto: itemRecibido.appProductsGetDto,
      },
    }); //1 edit
  }

  //eliminar item
  async remove(item: AppDetailQuotesGetDto) {
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
          handler: () => {},
        },
        {
          text: 'Confirmar',
          handler: () => {
            const deleteDto = new AppDetailQuotesDeleteDto();
            deleteDto.id = item.id;
            deleteDto.cotizacion = item.cotizacion;

            this.cotizacionesService
              .DeleteDetalleCotizacion(deleteDto)
              .pipe(takeUntil(this.destroy$))
              .subscribe((result) => {
                this.cotizacion = result.data;
                this.cotizacionesService.cotizacion$.next(this.cotizacion);
                if (result.meta.isValid) {
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
    const buttons: any[] = [
      {
        text: 'Actualizar',
        icon: 'create-outline',
        handler: () => {
          this.edit(item);
        },
      },
    ];

    buttons.push(
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
    );

    const actionSheet = this.actionSheetCtrl.create({
      header: 'Acciones...',
      buttons,
    });

    (await actionSheet).present();
  }

  private calcularPrecioBaseConFlete(item: AppDetailQuotesGetDto): number {
    const precioBase = Number(
      item?.unitPriceBaseProduction || item?.precioUsd || 0,
    );
    const porcFlete =
      Number(item?.porcFlete || 0) > 0
        ? Number(item.porcFlete)
        : Number(this.cotizacion?.porcFlete || 0);

    return this.detalleBusinessRules.calcularPrecioConFlete({
      precioBase,
      porcFlete,
    });
  }

}
