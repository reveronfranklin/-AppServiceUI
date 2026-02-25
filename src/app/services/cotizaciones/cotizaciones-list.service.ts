import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { GeneralService } from '../general.service';
import { AppGeneralQuotesGetDto } from '../../models/app-general-quotes-get-dto';
import {
  EspecificacionesUpdateDto,
  PartesFilter,
} from 'src/app/models/especificaciones';
import { catchError } from 'rxjs/operators';

import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class CotizacionesListService {
  basePath: string;
  basePatchVertical: string;
  accionPath: string;
  controller: string;
  direccionFacturarCliente$ = new ReplaySubject<any>();
  direccionEntregaCliente$ = new ReplaySubject<any>();

  public cotizacion$ = new ReplaySubject<any>();
  respuesta: Observable<AppGeneralQuotesGetDto>;

  allCotizaciones$ = new ReplaySubject<any>();
  allCompetidores$ = new ReplaySubject<any>();

  public precioLista: number;
  public precioListaProduccion: number;

  public filterSearchText: string = '';

  constructor(
    private http: HttpClient,
    private gensvc: GeneralService,
  ) {
    this.basePath = gensvc.getBasePath();
    this.basePatchVertical = gensvc.basePathVertical;
    this.precioLista = 0;
    this.precioListaProduccion = 0;
  }

  getCotizacion$(): Observable<AppGeneralQuotesGetDto> {
    return this.cotizacion$.asObservable();
  }

  setCotizacion$(cotiza: any): void {
    this.cotizacion$.next(cotiza);
  }

  //----------------------GENERAL COTIZACION ------------------------//

  GetAllGeneralCotizacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'GetAllAppGeneralQuotes';
    this.accionPath = 'GetAll';

    // Procesar fechas
    const fechaHasta = data.fechaHasta ? new Date(data.fechaHasta) : new Date();
    const fechaDesde = data.fechaDesde
      ? new Date(data.fechaDesde)
      : new Date(fechaHasta.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días antes

    // Formatear a ISO string con milisegundos (ej: "2026-01-02T20:17:08.149Z")
    const fechaDesdeISO = fechaDesde.toISOString();
    const fechaHastaISO = fechaHasta.toISOString();

    // Crear payload con fechas en formato ISO
    const payload = {
      ...data,
      fechaDesde: fechaDesdeISO,
      fechaHasta: fechaHastaISO,
    };
    console.log('payload', payload);
    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(payload),
      )
      .pipe();
  }
  GetAllSimpleGeneralCotizacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'GetAllSimpleAppGeneralQuotes';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  CopiarCotizacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'CopiarGeneralQuotes';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  RetornarAGrabacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'RegresarAGrabacionCotizacion';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  GetAllUnits(data): Observable<any> {
    this.controller = 'AppUnits/';
    this.accionPath = 'GetAllAppUnits';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  InsertGeneralCotizacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'InsertGeneralQuotes';

    this.controller = 'appgeneralquote/';
    this.accionPath = 'create';

    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  DeleteGeneralCotizacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'DeleteGeneralQuotes';

    this.controller = 'appgeneralquote/';
    this.accionPath = 'delete';

    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  UpdateGeneralCotizacion(data): Observable<any> {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'UpdateGeneralQuotes';

    this.controller = 'appgeneralquote/';
    this.accionPath = 'update';

    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  //--------------------------DETALLE DE COTIZACION --------------------------------//

  GetListaDetalleCotizacionPorGeneralId(data): Observable<any> {
    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'GetListAppDetailQuoteByAppGeneralQuotesId';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  InsertDetalleCotizacion(data): Observable<any> {
    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'InsertDetailQuotes';

    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'create';

    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  UpdateDetalleCotizacionFr(data): Observable<any> {
    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'UpdateDetailQuotes';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  UpdateDetalleCotizacion(data): Observable<any> {
    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'UpdateDetailQuotes';

    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'update';

    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error completo en UpdateDetalleCotizacion:', error);

          // Crear un objeto de error estructurado
          const structuredError = {
            meta: {
              isValid: false,
              message: this.getErrorMessage(error),
              errorCode: error.status || 0,
            },
            data: null,
            success: false,
          };

          // Retornar el error como un observable válido
          return of(structuredError);
        }),
      );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    console.log(error);
    if (error.status === 0) {
      return 'Error de conexión. Verifique su internet o contacte al administrador';
    } else if (error.status === 404) {
      return 'Servicio no encontrado';
    } else if (error.status === 500) {
      return 'Error interno del servidor';
    } else if (error.status === 400) {
      return 'Solicitud incorrecta';
    } else if (error.status === 401) {
      return 'No autorizado';
    } else if (error.status === 403) {
      return 'Acceso denegado';
    } else {
      return 'Error en el servidor. Por favor, intente nuevamente';
    }
  }
  DeleteDetalleCotizacion(data): Observable<any> {
    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'DeleteDetailQuotes';

    return this.http
      .post<any>(
        this.basePatchVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  // ---------------------------- ENVIAR COTIZACION ADMINISTRADOR ----------------------- //

  EnviarAlCliente(data) {
    this.controller = 'AppGeneralQuotes/';
    this.accionPath = 'EnviarAlCliente';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  // ---------------------------- GANAR PERDER COTIZACION ----------------------- //

  GetAllMotivoGanarPerder(data) {
    this.controller = 'MotivoGanarPerder/';
    this.accionPath = 'MotivoGanarPerderGetAllFilter';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  GetAllCompetidorGanarPerder(data) {
    this.controller = 'Competidores/';
    this.accionPath = 'GetByAllFilter';

    this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .subscribe((result) => {
        this.allCompetidores$.next(result);
      });
  }

  UpdateGanarPerder(data) {
    this.controller = 'AppDetailQuotes/';
    this.accionPath = 'GanarPerder';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  //************************ ESPECIFICACIONS********************* */
  //*************RECIBE PartesFilter Y RETORNA EspecificacionesGetDto************************************************* */
  GetEspecificacionesCotizacion(data: PartesFilter): Observable<any> {
    this.controller = 'AppEspecificaciones/';
    this.accionPath = 'GetAllFilter';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }
  updateEspecificacionesCotizacion(
    data: EspecificacionesUpdateDto,
  ): Observable<any> {
    this.controller = 'AppEspecificaciones/';
    this.accionPath = 'UpdateEspecificaciones';

    return this.http
      .post<any>(
        this.basePath + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }
}
