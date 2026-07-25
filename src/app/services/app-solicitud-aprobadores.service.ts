import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneralService } from './general.service';
import {
  AppSolicitudAprobadorResponse,
  CreateAppSolicitudAprobadorCommand,
  DeleteAppSolicitudAprobadorResponse,
  GetAllOficinasQuery,
  GetAllPagedAppSolicitudAprobadoresQuery,
  GetAllUsuariosActivosQuery,
  OficinaResponse,
  ResultDto,
  UpdateAppSolicitudAprobadorCommand,
  UsuarioActivoResponse,
} from '../models/app-solicitud-aprobador.model';

@Injectable({
  providedIn: 'root',
})
export class AppSolicitudAprobadoresService {
  private readonly controller = 'appsolicitudaprobadores/';

  constructor(
    private http: HttpClient,
    private generalService: GeneralService,
  ) {}

  create(
    command: CreateAppSolicitudAprobadorCommand,
  ): Observable<ResultDto<AppSolicitudAprobadorResponse>> {
    return this.post<AppSolicitudAprobadorResponse>('new', command);
  }

  update(
    command: UpdateAppSolicitudAprobadorCommand,
  ): Observable<ResultDto<AppSolicitudAprobadorResponse>> {
    return this.put<AppSolicitudAprobadorResponse>('edit', command);
  }

  delete(id: number): Observable<ResultDto<DeleteAppSolicitudAprobadorResponse>> {
    return this.post<DeleteAppSolicitudAprobadorResponse>('delete', { id });
  }

  getById(id: number): Observable<ResultDto<AppSolicitudAprobadorResponse>> {
    return this.post<AppSolicitudAprobadorResponse>('getById', { id });
  }

  getAllPaged(
    query: GetAllPagedAppSolicitudAprobadoresQuery,
  ): Observable<ResultDto<AppSolicitudAprobadorResponse[]>> {
    return this.post<AppSolicitudAprobadorResponse[]>('getAllPaged', {
      pageSize: query?.pageSize ?? 10,
      pageNumber: query?.pageNumber ?? 1,
      searchText: query?.searchText ?? '',
    });
  }

  getAllOficinas(
    query: GetAllOficinasQuery,
  ): Observable<ResultDto<OficinaResponse[]>> {
    return this.post<OficinaResponse[]>('getAllOficinas', query);
  }

  getAllUsuariosActivos(
    query: GetAllUsuariosActivosQuery = {},
  ): Observable<ResultDto<UsuarioActivoResponse[]>> {
    return this.post<UsuarioActivoResponse[]>('getAllUsuariosActivos', {
      searchText: query?.searchText ?? '',
    });
  }

  private post<T>(action: string, body: any): Observable<ResultDto<T>> {
    return this.http.post<ResultDto<T>>(
      this.generalService.basePathVertical + this.controller + action,
      JSON.stringify(body),
    );
  }

  private put<T>(action: string, body: any): Observable<ResultDto<T>> {
    return this.http.put<ResultDto<T>>(
      this.generalService.basePathVertical + this.controller + action,
      JSON.stringify(body),
    );
  }
}
