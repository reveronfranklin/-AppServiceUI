export interface PrecioDto {
  unitPriceBaseProduction: number;
  precioMasFlete: number;

  precioMaximo: number;
  precioMaximoMasFlete: number;

  calculoId: number;
  flete: number;
  porcFlete: number;
  porDebajoDeCantidadMinima: boolean;
}
