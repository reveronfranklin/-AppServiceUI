export interface ActualizarCotizacion {
  //Paginacion
  usuarioConectado: string;
  idCliente: string;
  cotizacion: string;
  renglon: number;
  propuesta: number;
  tasaExcepcion: number;
  fechaPago: Date;
  imprimirFacturaEnUSD: boolean;
  solicitudDeCredito? :number;
}
