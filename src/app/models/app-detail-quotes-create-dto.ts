import { AppConversionUnitGenericCreateDto } from './app-conversion-unit-generic-create-dto';
export class AppDetailQuotesCreateDto {
  appGeneralQuotesId: number;
  cotizacion: string;
  producto: string;
  condicionPago: number; //condicionPago
  idProducto: number;
  nombreComercialProducto: string;
  idEstatus: number;
  cantidad: number;
  cantidadSolicitada: number;
  precio: number;
  total: number;
  precioUsd: number;
  totalUsd: number;
  idUnidad: number;
  observaciones: string;
  diasEntrega: number;
  appConversionUnitGenericCreateDto: AppConversionUnitGenericCreateDto =
    new AppConversionUnitGenericCreateDto();
  precioLista: number;
  quantityPerPackage: number;
  solicitarPrecio: boolean;
  obsSolicitud: string;
  obsSolicitudSobreprecio: string;
  medidaBasica: string;
  medidaOpuesta: string;
  valorConvertido: number;
  ordenAnterior: number;
  cantidadPorUnidadProduccion: number;
  calculoId: number;
  unitPriceBaseProductionMaximo: number;
  porcMaximoSobrePrecio: number;
  forma: string;
  salida: string;
  presentacion: string;
  eliminarSolicitud: boolean;
  usuarioConectado;
  string;
}
