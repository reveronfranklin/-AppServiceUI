import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneralService } from './general.service';
import {
  AppSolicitudAprobacion,
  AppSolicitudAprobacionLoteResponse,
  AprobarRechazarAppSolicitudAprobacionCommand,
  AprobarRechazarLoteAppSolicitudAprobacionCommand,
  CreateAppSolicitudAprobacionCommand,
  CreateFromDetailQuoteAppSolicitudAprobacionCommand,
  DeleteAppSolicitudAprobacionResponse,
  GetAllPagedAppSolicitudAprobacionQuery,
  ListSolicitudesPendientesAppSolicitudAprobacionQuery,
  ResultDto,
  UpdateAppSolicitudAprobacionCommand,
} from '../models/app-solicitud-aprobacion.model';

@Injectable({
  providedIn: 'root',
})
export class AppSolicitudAprobacionService {
  private readonly controller = 'appsolicitudaprobacion/';

  constructor(
    private http: HttpClient,
    private generalService: GeneralService,
  ) {}

  getAllPaged(
    query: GetAllPagedAppSolicitudAprobacionQuery,
  ): Observable<ResultDto<AppSolicitudAprobacion[]>> {
    return this.post<AppSolicitudAprobacion[]>('getAllPaged', query);
  }

  listPendientes(
    query: ListSolicitudesPendientesAppSolicitudAprobacionQuery,
  ): Observable<ResultDto<AppSolicitudAprobacion[]>> {
    return this.post<AppSolicitudAprobacion[]>(
      'listSolicitudesPendientes',
      query,
    );
  }

  getById(id: number): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('getById', { id });
  }

  getByCotizacionProducto(
    cotizacion: string,
    codigoProducto: string,
  ): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('solicitudByCotizacionProducto', {
      cotizacion,
      codigoProducto,
    });
  }

  createFromDetailQuote(
    command: CreateFromDetailQuoteAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('createFromDetailQuote', command);
  }

  aprobar(
    command: AprobarRechazarAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('aprobar', command);
  }

  rechazar(
    command: AprobarRechazarAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('rechazar', command);
  }

  aprobarLote(
    command: AprobarRechazarLoteAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacionLoteResponse>> {
    return this.post<AppSolicitudAprobacionLoteResponse>('aprobarLote', command);
  }

  rechazarLote(
    command: AprobarRechazarLoteAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacionLoteResponse>> {
    return this.post<AppSolicitudAprobacionLoteResponse>('rechazarLote', command);
  }

  delete(id: number): Observable<ResultDto<DeleteAppSolicitudAprobacionResponse>> {
    return this.post<DeleteAppSolicitudAprobacionResponse>('delete', { id });
  }

  create(
    command: CreateAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('create', command);
  }

  update(
    command: UpdateAppSolicitudAprobacionCommand,
  ): Observable<ResultDto<AppSolicitudAprobacion>> {
    return this.post<AppSolicitudAprobacion>('update', command);
  }

  private post<T>(action: string, body: any): Observable<ResultDto<T>> {
    return this.http.post<ResultDto<T>>(
      this.generalService.basePathVertical + this.controller + action,
      JSON.stringify(body),
    );
  }
}
