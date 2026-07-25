export interface ResultDto<T> {
  data: T | null;
  isValid: boolean;
  linkData: string;
  linkDataArlternative: string;
  message: string;
  page: number;
  totalPage: number;
  cantidadRegistros: number;
  total1: number;
  descripcionTotal1: string;
  total2: number;
  descripcionTotal2: string;
  total3: number;
  descripcionTotal3: string;
  total4: number;
  descripcionTotal4: string;
  meta?: any;
}

export interface AppSolicitudAprobacion {
  id: number;
  cotizacion: string;
  codigoProducto: string;
  descripcionProducto: string | null;
  appProductId: number;
  appGeneralQuotesId: number;
  appDetailQuotesId: number;
  cantidad: number | null;
  precioVenta: number;
  totalVenta: number | null;
  precioMinimo: number;
  precioMaximo: number;
  porcentajeSobrePrecio: number;
  codigoCondicionPago: number | null;
  condicionPago: string | null;
  observacionSolicitante: string;
  observacionAprobador: string | null;
  usuarioSolicitante: string | null;
  usuarioAprobador: string | null;
  aprobado: boolean;
  rechazado: boolean;
  fechaAprobado: string | null;
  fechaRechazado: string | null;
  oficina: number;
  nombreOfiicina: string | null;
  vendedor: string;
  nombreVendedor: string | null;
  codigoCliente: string;
  razonSocial: string;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaActualizacion: string | null;
  usuarioActualizacion: string | null;
}

export interface GetAllPagedAppSolicitudAprobacionQuery {
  fechaDesde: string;
  fechaHasta: string;
  usuarioConectado: string;
  pageSize: number;
  pageNumber: number;
  searchText: string;
}

export interface ListSolicitudesPendientesAppSolicitudAprobacionQuery {
  UsuarioConectado: string;
}

export interface CreateFromDetailQuoteAppSolicitudAprobacionCommand {
  cotizacion: string;
  codigoProducto: string;
  usuarioSolicitante: string;
  observacionSolicitante: string;
}

export interface AprobarRechazarAppSolicitudAprobacionCommand {
  cotizacion: string;
  producto: string;
  usuarioAprobador: string;
  observacionAprobador: string;
}

export interface AppSolicitudAprobacionLoteItem {
  cotizacion: string;
  producto: string;
}

export interface AppSolicitudAprobacionLoteItemResult {
  cotizacion: string;
  producto: string;
  procesado: boolean;
  message: string;
}

export interface AppSolicitudAprobacionLoteResponse {
  total: number;
  procesadas: number;
  fallidas: number;
  resultados: AppSolicitudAprobacionLoteItemResult[];
}

export interface AprobarRechazarLoteAppSolicitudAprobacionCommand {
  usuarioAprobador: string;
  observacionAprobador: string;
  solicitudes: AppSolicitudAprobacionLoteItem[];
}

export interface DeleteAppSolicitudAprobacionResponse {
  deleted: boolean;
}

export interface CreateAppSolicitudAprobacionCommand {
  cotizacion: string;
  codigoProducto: string;
  appProductId: number;
  appGeneralQuotesId: number;
  appDetailQuotesId: number;
  cantidad: number | null;
  precioVenta: number;
  totalVenta: number | null;
  precioMinimo: number;
  precioMaximo: number;
  porcentajeSobrePrecio: number;
  codigoCondicionPago: number | null;
  condicionPago: string | null;
  observacionSolicitante: string;
  observacionAprobador: string | null;
  usuarioSolicitante: string | null;
  usuarioAprobador: string | null;
  aprobado: boolean;
  rechazado: boolean;
  fechaAprobado: string | null;
  fechaRechazado: string | null;
  oficina: number;
  nombreOfiicina: string | null;
  vendedor: string;
  nombreVendedor: string | null;
  codigoCliente: string;
  razonSocial: string;
  usuarioCreacion: string;
}

export interface UpdateAppSolicitudAprobacionCommand
  extends Omit<CreateAppSolicitudAprobacionCommand, 'usuarioCreacion'> {
  id: number;
  usuarioActualizacion: string;
}
