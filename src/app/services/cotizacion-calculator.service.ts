import { Injectable } from '@angular/core';
import { AppProductConversionGetDto } from '../models/app-product-conversion-get-dto';
import { AppPriceDto } from '../models/app-price-dto';

export interface ResultConversionUnidadesMetrosCuadrados {
  resulCantidad: number;
  area: number;
}

import { Conversion } from '../models/conversion';

@Injectable({
  providedIn: 'root'
})
export class CotizacionCalculatorService {

  constructor() { }

  redondear(numero: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(numero * factor) / factor;
  }

  encontrarValorMasCercano(
    item: any,
    objetivo: number,
    ...valores: number[]
  ): number {
    if (valores.length === 0) {
      throw new Error('Debe proporcionar al menos un valor para comparar');
    }

    let valorMasCercano = valores.reduce((prev, curr) =>
      Math.abs(curr - objetivo) < Math.abs(prev - objetivo) ? curr : prev,
    );

    if (
      item.appProductConversionGetDto &&
      item.appProductConversionGetDto.appUnitsIdAlternativa === item.idUnidad &&
      item.unitPriceConverted > 0
    ) {
      valorMasCercano = item.unitPriceConverted;
    }

    return valorMasCercano > 0 ? valorMasCercano : valores[0] || objetivo;
  }

  calculaConversion(
    cantidadSolicitada: number,
    medidaBasica: number,
    medidaOpuesta: number,
  ): ResultConversionUnidadesMetrosCuadrados {
    const res: ResultConversionUnidadesMetrosCuadrados = {
      resulCantidad: 0,
      area: 0,
    };

    if (medidaBasica > 0 && medidaOpuesta > 0) {
      res.area = (medidaBasica * medidaOpuesta) / 1000000;
      if (res.area > 0) {
        res.resulCantidad = 1 / res.area;
      }
    } else {
      res.resulCantidad = 1;
      res.area = 0;
    }
    return res;
  }

  calculoConversionGenerico(
    appProductConversionGetDto: AppProductConversionGetDto,
    cantidad: number,
  ): number {
    if (!appProductConversionGetDto) return cantidad;
    
    const conversion = new Conversion(
      appProductConversionGetDto.xNumerador,
      appProductConversionGetDto.yDenominador,
      cantidad,
    );
    return conversion.getCantidadAlternativa();
  }

  buscarPrecioPorRango(_appPriceDto: AppPriceDto[], cantidad: number): number {
    let price = 0;
    if (_appPriceDto && _appPriceDto.length > 0) {
      const item = _appPriceDto.find(
        (x) => cantidad >= x.desde && cantidad <= x.hasta,
      );
      if (item) {
        price = item.precio;
      } else {
        // Si no está en el rango, buscar el último
        price = _appPriceDto[_appPriceDto.length - 1].precio;
      }
    }
    return price;
  }

  buscarPrecioMaximoPorRango(
    _appPriceDto: AppPriceDto[],
    cantidad: number,
  ): number {
    let price = 0;
    if (_appPriceDto && _appPriceDto.length > 0) {
      const item = _appPriceDto.find(
        (x) => cantidad >= x.desde && cantidad <= x.hasta,
      );
      if (item) {
        price = item.precioMaximo;
      } else {
        price = _appPriceDto[_appPriceDto.length - 1].precioMaximo;
      }
    }
    return price;
  }

}
