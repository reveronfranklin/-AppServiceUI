export interface ConsultaPorRifRequestDto {
  Rif: string;
}

export interface ClienteBusquedaPorRif {
  codigo: string;
  nombre: string;
  rif: string;
}

export interface ClienteBusquedaPorRifResponseDto {
  data: ClienteBusquedaPorRif[];
  isValid: boolean;
  message: string;
}

export interface ClientePorRifDto {
  codigo: string;
  nombre: string;
  vendedor1: string;
  nombreVendedor: string;
  fechaApertura: string | null;
  fechaUltimaFactura: string | null;
  fechaModificacion: string | null;
  flagInactivo: string;
  oficina: string;
  flagAtendido: string | null;
}

export interface EstadisticaPorRifDto {
  cotizacion: string;
  nombre: string;
  cliente: number;
  orden: number;
  anio: number;
  mes: number;
  nombreVendedor: string;
  nombreProducto: string;
  millaresP: number;
  ventaDolRef: number;
  fiscal: string;
}

export interface CotizacionPorRifDto {
  cotizacion: string;
  cliente: string;
  anio: number;
  mes: number;
  subCategoria: string;
  producto: string;
  vendedor: string;
  descripcion: string;
  motivo: string;
  orden: number;
  totalPropuestaUsd: number;
}

export interface NumeracionFiscalPorRifDto {
  cotizacion: string;
  idNumeracion: number;
  rif: string;
  orden: number;
  copy: number;
  numeroSerieControlDesde: string | null;
  numeroControlDesde: string | null;
  numeroSerieControlHasta: string | null;
  numeroControlHasta: string | null;
  numeroSerieFormatoDesde: string | null;
  numeroFormatoDesde: string | null;
  numeroSerieFormatoHasta: string | null;
  numeroFormatoHasta: string | null;
  tipoDocumento: string;
  longitudMascara: number;
  longitudMascaraFormato: number;
  usuarioAgrega: string | null;
  fechaAgrega: string | null;
}

export interface ConsultaPorRifDataDto {
  clientes: ClientePorRifDto[];
  estadisticas: EstadisticaPorRifDto[];
  cotizaciones: CotizacionPorRifDto[];
  numeracionesFiscales: NumeracionFiscalPorRifDto[];
}

export interface ConsultaPorRifResponseDto {
  data: ConsultaPorRifDataDto;
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
  meta: any;
}
