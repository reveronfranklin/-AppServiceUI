export interface ResultDto<T> {
  data: T | null;
  isValid: boolean;
  message: string;
  cantidadRegistros: number;
  page: number;
  totalPage: number;
  meta?: unknown;
}

export interface AppSolicitudAprobadorResponse {
  id: number;
  usuario: string | null;
  oficina: number | null;
  nombreOficina: string | null;
}

export interface CreateAppSolicitudAprobadorCommand {
  usuario: string;
  oficina: number;
}

export interface UpdateAppSolicitudAprobadorCommand
  extends CreateAppSolicitudAprobadorCommand {
  id: number;
}

export interface DeleteAppSolicitudAprobadorCommand {
  id: number;
}

export interface DeleteAppSolicitudAprobadorResponse {
  deleted: boolean;
}

export interface GetAppSolicitudAprobadorByIdQuery {
  id: number;
}

export interface GetAllPagedAppSolicitudAprobadoresQuery {
  pageSize?: number;
  pageNumber?: number;
  searchText?: string;
}

export interface GetAllOficinasQuery {
  searchText?: string;
}

export interface OficinaResponse {
  codigoOficina: number;
  nombreOficina: string;
}

export interface GetAllUsuariosActivosQuery {
  searchText?: string;
}

export interface UsuarioActivoResponse {
  usuario?: string | null;
  user?: string | null;
  codigoUsuario?: string | null;
  nombreUsuario?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
}
