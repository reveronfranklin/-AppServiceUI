import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, catchError, finalize } from 'rxjs/operators';
import { AppGeneralQuotesQueryFilter } from 'src/app/interfaces/App-General-Quotes-Query-Filter';
import { IUsuario } from 'src/app/interfaces/iusuario';
import { AppGeneralQuotesDeleteDto } from 'src/app/models/app-general-quotes-delete-dto';
import { AppGeneralQuotesGetDto } from 'src/app/models/app-general-quotes-get-dto';
import { CotizacionesListService } from 'src/app/services/cotizaciones/cotizaciones-list.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-cotizacion-delete',
  templateUrl: './cotizacion-delete.page.html',
  styleUrls: ['./cotizacion-delete.page.scss'],
})
export class CotizacionDeletePage implements OnInit, OnDestroy {
  public cotizacion: AppGeneralQuotesGetDto;
  appGeneralQuotesQueryFilter: AppGeneralQuotesQueryFilter;
  appGeneralQuotesDeleteDto: AppGeneralQuotesDeleteDto =
    new AppGeneralQuotesDeleteDto();
  public _eliminando: boolean = false;
  usuario: IUsuario;

  // Para manejar la destrucción de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public alertController: AlertController,
    private CotizacionesService: CotizacionesListService,
    public toastController: ToastController,
    private gs: GeneralService,
  ) {}

  ngOnInit() {
    // Suscripción con manejo de unsubscribe
    this.CotizacionesService.cotizacion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dat) => {
        if (!dat) {
          //this.mostrarError('No hay cotización seleccionada');
          this.router.navigate(['menu/cotizaciones-list']);
          //return;
        }

        this.cotizacion = dat;
        this.appGeneralQuotesDeleteDto.cotizacion = this.cotizacion.cotizacion;
        this.appGeneralQuotesDeleteDto.id = this.cotizacion.id;
      });

    this.usuario = this.gs.GetUsuario();

    // Verificar si hay usuario
    if (!this.usuario?.user) {
      this.mostrarError('Usuario no identificado');
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  async presentAlert() {
    // Validar que haya cotización
    if (!this.cotizacion) {
      this.mostrarError('No hay cotización para eliminar');
      return;
    }

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmar eliminación',
      subHeader: `Cotización: ${this.cotizacion.cotizacion}`,
      message:
        '¿Está seguro de eliminar esta cotización? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            this.eliminarCotizacion();
          },
        },
      ],
    });

    await alert.present();
  }

  async mostrarMensaje(
    message: string,
    tipo: 'success' | 'danger' | 'warning' = 'success',
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: tipo,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }

  private mostrarError(mensaje: string) {
    this.mostrarMensaje(mensaje, 'danger');
  }

  eliminarCotizacion() {
    if (this._eliminando) return; // Prevenir doble clic

    this._eliminando = true;

    // Configurar filtro para recargar la lista
    this.appGeneralQuotesQueryFilter = {
      pageSize: 100,
      pageNumber: 1,
      usuarioConectado: this.usuario.user,
      cotizacion: '',
      searchText: '',
      statusId: 0,
    };

    // Usar switchMap para encadenar operaciones y evitar suscripciones anidadas
    this.CotizacionesService.DeleteGeneralCotizacion(
      this.appGeneralQuotesDeleteDto,
    )
      .pipe(
        switchMap((deleteResult: any) => {
          if (!deleteResult.meta.isValid) {
            throw new Error(deleteResult.meta.message);
          }

          // Limpiar la cotización actual
          this.CotizacionesService.cotizacion$.next(null);

          // Recargar la lista de cotizaciones
          return this.CotizacionesService.GetAllGeneralCotizacion(
            this.appGeneralQuotesQueryFilter,
          );
        }),
        catchError((error) => {
          this.mostrarError(error.message || 'Error al eliminar la cotización');
          throw error;
        }),
        finalize(() => {
          this._eliminando = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (listResult) => {
          // Actualizar la lista de cotizaciones
          this.CotizacionesService.allCotizaciones$.next(listResult.data);

          // Mostrar mensaje de éxito
          this.mostrarMensaje('Cotización eliminada exitosamente');

          // Navegar después de un breve delay para que el usuario vea el mensaje
          setTimeout(() => {
            this.router.navigate(['menu/cotizaciones-list']);
          }, 1500); // Reducido a 1.5 segundos
        },
        error: (error) => {
          console.error('Error en proceso de eliminación:', error);
        },
      });
  }

  // Método para cancelar/volver
  cancelar() {
    this.router.navigate(['menu/cotizaciones-list']);
  }
}
