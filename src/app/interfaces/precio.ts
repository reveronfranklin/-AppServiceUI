export interface PrecioDto {
  unitPriceBaseProduction: number;
  precioMasFlete: number;

  precioMaximo: number;
  precioMaximoMasFlete: number;

  calculoId: number;
  flete: number;
  fleteMaximo?: number;
  porcFlete: number;
  precioPorRango?: number;
  desde?: number;
  hasta?: number;
  porDebajoDeCantidadMinima: boolean;
  porcMaximoSobrePrecio: number;
}
