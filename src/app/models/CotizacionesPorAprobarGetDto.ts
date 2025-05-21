export class CotizacionesPorAprobarGetDto {
  cotizacion: string;
  renglon: number;
  propuesta: number;
  idCliente: string;
  razonSocial: string;
  producto: string;
  codigoProducto: string;
  vendedor: string;
  fecha: Date;
  fechaString: string;
  oficina: string;
  nombreOficina: string;
  searchText: string;
  totalPropuestaUsd: number;
  totalPropuestaUsdString: string;
  obsSolicitudPrecio: string;
  idSolicitudPrecio: number;
  tasaExcepcion: number;
  fechaPago: Date;
  imprimirFacturaEnUSD: boolean;
  estatusPlanta: string;
  recibo: string;
  appSubCategoryId: number;
  rif: string;
  fiscal: string;
  tieneRifAdjunto: boolean;
  orden: number;
  cotizacionCorta:number;
  solicitudDeCredito :number;
  observacionesCreditoExcepcion:string;
  dercripcionStatusExcepcion:string;
  aprobado:boolean;
  rechazado :boolean;
  solicitudCerrada:boolean;
  fechaCompromiso :Date;


}
