import { Injectable } from '@angular/core';
import { StatusAprobacionDto } from '../models/app-status-aprobacion-dto';

export interface ResultadoConcesion {
  porcentaje: number;
  texto: string;
}

export interface ResultadoAprobacionPrecio {
  requiereAprobacion: boolean;
  colorToolbar: string;
  solicitarPrecio: boolean;
  mensajeBotonSolicitarPrecio: string;
}

export interface ResultadoEstadoPrecio {
  concesion: ResultadoConcesion;
  aprobacion: ResultadoAprobacionPrecio;
}

export interface ParametrosAprobacionPrecio {
  precioBaseConFlete: number;
  precioVentaUsd: number;
  requiereEstimacion: boolean;
  porDebajoDeCantidadMinima: boolean;
  idEstatus: number;
  aprobado: boolean;
  flagCerrado: boolean;
  operacion: number;
  isBs: boolean;
  codigoProducto?: string;
}

export interface ParametrosValidacionGuardado {
  diasEntrega: number;
  tipoCalculo: number;
  medidaBasica: number;
  medidaOpuesta: number;
  requiereAprobacionPrecio: boolean;
  observacionSolicitud: string;
  appSubCategoryId: number;
  salida: string;
  forma: string;
  presentacion: string;
  precioAprobadoUsd: number;
  precioVentaUsd: number;
}

export interface ParametrosTotalVenta {
  precioUsd: number;
  cantidad: number;
  cantidadSolicitada: number;
  tasa: number;
  ultimoPrecioUsd: number;
  tipoCalculo: number;
  idUnidad: number;
}

export interface ResultadoTotalVenta {
  cantidad: number;
  total: number;
  totalUsd: number;
  precio: number;
  ultimoPrecioUsd: number;
  actualizarPrecio: boolean;
}

export interface ParametrosFleteMaximo {
  precioMaximo: number;
  porcFlete: number;
  precioMaximoMasFlete?: number;
}

export interface ParametrosPrecioConFlete {
  precioBase: number;
  porcFlete: number;
}

export interface ParametrosIdentidadProductoDetalle {
  operacion: number;
  idProductoOriginal: number;
  idProductoActual: number;
}

export interface ParametrosAdicionarDetalle {
  cantidadItems: number;
  permiteAdicionarDetalle: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CotizacionDetalleBusinessRulesService {
  readonly maximoItemsProducto = 5;

  private toNumber(value: any): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  truncarLimiteComercial(value: number): number {
    const limite = this.toNumber(value);
    return Math.trunc((limite + Number.EPSILON) * 100) / 100;
  }

  calcularConcesion(
    precioBaseConFlete: number,
    precioVentaUsd: number,
  ): ResultadoConcesion {
    const precioBase = this.truncarLimiteComercial(precioBaseConFlete);
    const precioVenta = Number(precioVentaUsd || 0);

    if (precioBase === 0) {
      return { porcentaje: 0, texto: '' };
    }

    const porcentaje = ((precioBase - precioVenta) / precioBase) * 100;

    if (porcentaje < 0) {
      return {
        porcentaje,
        texto: `+${Number(porcentaje.toFixed(2)) * -1}% de sobre margen`,
      };
    }

    if (porcentaje > 0) {
      return {
        porcentaje,
        texto: `-${Number(porcentaje.toFixed(2))}% de descuento`,
      };
    }

    return { porcentaje, texto: '0% de descuento' };
  }

  calcularPorcentajeSobreprecio(
    precioBaseConFlete: number,
    precioVentaUsd: number,
  ): number {
    const precioBase = this.truncarLimiteComercial(precioBaseConFlete);
    const precioVenta = Number(precioVentaUsd || 0);

    if (precioBase <= 0 || precioVenta <= precioBase) {
      return 0;
    }

    return ((precioVenta - precioBase) / precioBase) * 100;
  }

  puedeEnviarAprobacionPorSobreprecio(
    precioBaseConFlete: number,
    precioVentaUsd: number,
    porcMaximoSobrePrecio: number,
  ): boolean {
    return (
      this.calcularPorcentajeSobreprecio(precioBaseConFlete, precioVentaUsd) >
      this.toNumber(porcMaximoSobrePrecio)
    );
  }

  puedeAgregarProducto(cantidadItems: number): boolean {
    return this.toNumber(cantidadItems) < this.maximoItemsProducto;
  }

  puedeAdicionarDetalle(params: ParametrosAdicionarDetalle): boolean {
    return (
      params?.permiteAdicionarDetalle === true &&
      this.puedeAgregarProducto(params?.cantidadItems || 0)
    );
  }

  validarCantidadMaximaProductos(cantidadItems: number): string {
    if (this.puedeAgregarProducto(cantidadItems)) {
      return '';
    }

    return `La cotización permite un máximo de ${this.maximoItemsProducto} productos`;
  }

  validarAdicionarDetalle(params: ParametrosAdicionarDetalle): string {
    if (!this.puedeAgregarProducto(params?.cantidadItems || 0)) {
      return `La cotización permite un máximo de ${this.maximoItemsProducto} productos`;
    }

    if (params?.permiteAdicionarDetalle !== true) {
      return 'La cotización ya contiene un producto que no permite adicionar más detalles';
    }

    return '';
  }

  validarIdentidadProductoDetalle(
    params: ParametrosIdentidadProductoDetalle,
  ): string {
    if (params.operacion !== 1) {
      return '';
    }

    const idProductoOriginal = this.toNumber(params.idProductoOriginal);
    const idProductoActual = this.toNumber(params.idProductoActual);

    if (idProductoOriginal === idProductoActual) {
      return '';
    }

    return 'No se puede modificar el producto de un ítem existente. Elimine el ítem y agregue uno nuevo con el producto correcto.';
  }

  calcularFleteMaximo(params: ParametrosFleteMaximo): number {
    const precioMaximo = this.toNumber(params.precioMaximo);
    const precioMaximoMasFlete = this.toNumber(params.precioMaximoMasFlete);

    if (precioMaximoMasFlete > 0) {
      return Math.max(precioMaximoMasFlete - precioMaximo, 0);
    }

    return (precioMaximo * this.toNumber(params.porcFlete)) / 100;
  }

  calcularPrecioConFlete(params: ParametrosPrecioConFlete): number {
    const precioBase = this.toNumber(params.precioBase);
    const flete = (precioBase * this.toNumber(params.porcFlete)) / 100;

    return this.truncarLimiteComercial(precioBase + flete);
  }

  getColorEstatusAprobacion(statusString: string): string {
    const status = (statusString || '').toUpperCase();

    if (
      status.includes('NO ESTA APROB') ||
      status.includes('NO ESTÁ APROB') ||
      status.includes('NO APROB')
    ) {
      return 'danger';
    }

    if (status.includes('RECH')) {
      return 'danger';
    }

    if (status.includes('PEND')) {
      return 'warning';
    }

    if (status.includes('APROB')) {
      return 'success';
    }

    return 'medium';
  }

  crearEstadoAprobadoInicial(): StatusAprobacionDto {
    return {
      flagAprobado: true,
      flagCerrado: false,
      valorVentaAprobar: 0,
      valorVentaAprobarUsd: 0,
      precioEstimacion: 0,
      aprobado: true,
      color: 'primary',
      statusString: 'APROBADO',
    };
  }

  prepararObservacionSolicitudPrecio(
    observacion: string,
    requiereEstimacion: boolean,
  ): string {
    const observacionSolicitud = observacion || '';

    if (!requiereEstimacion) {
      return observacionSolicitud;
    }

    return `***SOLICITUD DE ESTIMACION****${observacionSolicitud}`;
  }

  evaluarAprobacionPrecio(
    params: ParametrosAprobacionPrecio,
  ): ResultadoAprobacionPrecio {
    const resultadoBase: ResultadoAprobacionPrecio = {
      requiereAprobacion: false,
      colorToolbar: 'primary',
      solicitarPrecio: false,
      mensajeBotonSolicitarPrecio: '',
    };

    if (params.operacion === 1) {
      if (params.idEstatus >= 5) {
        return resultadoBase;
      }

      if (params.aprobado && params.flagCerrado) {
        return {
          ...resultadoBase,
          colorToolbar: 'success',
        };
      }
    }

    const requiereAprobacion =
      this.truncarLimiteComercial(params.precioBaseConFlete) > params.precioVentaUsd ||
      params.requiereEstimacion ||
      params.porDebajoDeCantidadMinima ||
      (params.operacion !== 1 && params.isBs);

    if (!requiereAprobacion) {
      return resultadoBase;
    }

    return {
      requiereAprobacion: true,
      colorToolbar: 'danger',
      solicitarPrecio: true,
      mensajeBotonSolicitarPrecio: this.getMensajeBotonAprobacion(
        params.requiereEstimacion,
        params.codigoProducto,
        params.operacion,
      ),
    };
  }

  evaluarEstadoPrecio(params: ParametrosAprobacionPrecio): ResultadoEstadoPrecio {
    return {
      concesion: this.calcularConcesion(
        params.precioBaseConFlete,
        params.precioVentaUsd,
      ),
      aprobacion: this.evaluarAprobacionPrecio(params),
    };
  }

  validarGuardado(params: ParametrosValidacionGuardado): string {
    if (Number(params.diasEntrega || 0) === 0) {
      return 'Indique Los dias de entrega';
    }

    if (
      (params.tipoCalculo === 1 || params.tipoCalculo === 4) &&
      (Number(params.medidaBasica || 0) <= 0 ||
        Number(params.medidaOpuesta || 0) <= 0)
    ) {
      return 'Indique Medida Basica y Medida Opuesta';
    }

    if (
      params.requiereAprobacionPrecio === true &&
      (params.observacionSolicitud || '') === ''
    ) {
      return 'Indique observación de solicitud de precios y presione enviar solicitud';
    }

    if (params.appSubCategoryId === 9 && (params.salida || '').length <= 0) {
      return 'Debe indicar la salida de la Etiqueta';
    }

    if (params.appSubCategoryId === 9 && (params.forma || '').length <= 0) {
      return 'Debe indicar la  Forma de la Etiqueta (Regular,Irregular)';
    }

    if (
      params.appSubCategoryId === 9 &&
      (params.presentacion || '').length <= 5
    ) {
      return 'Debe indicar la Presentación de la Etiqueta (mínimo 5 dígitos)';
    }

    if (
      Number(params.precioAprobadoUsd || 0) > 0 &&
      Number(params.precioVentaUsd || 0) < this.truncarLimiteComercial(params.precioAprobadoUsd)
    ) {
      return 'Precio es menor a el precio Aprobado';
    }

    return '';
  }

  calcularTotalVenta(params: ParametrosTotalVenta): ResultadoTotalVenta {
    const precioUsd = Number(params.precioUsd || 0);
    const tasa = Number(params.tasa || 0);
    let cantidad = Number(params.cantidad || 0);

    if (params.tipoCalculo === 4 && Number(params.idUnidad || 0) === 615) {
      cantidad = Number(params.cantidadSolicitada || 0) / 1000;
    }

    const actualizarPrecio =
      tasa > 0 && Number(params.ultimoPrecioUsd || 0) !== precioUsd;

    return {
      cantidad,
      total: precioUsd * tasa * cantidad,
      totalUsd: precioUsd * cantidad,
      precio: actualizarPrecio ? precioUsd * tasa : 0,
      ultimoPrecioUsd: actualizarPrecio
        ? precioUsd
        : Number(params.ultimoPrecioUsd || 0),
      actualizarPrecio,
    };
  }

  private getMensajeBotonAprobacion(
    requiereEstimacion: boolean,
    codigoProducto: string,
    operacion: number,
  ): string {
    const prefijo = operacion === 1 ? '' : ' ';

    if (requiereEstimacion) {
      return `${prefijo}Enviar Aprobación Por Estimación(${codigoProducto || ''})  y Salvar`;
    }

    return `${prefijo}Enviar Aprobación Por Precio y Salvar`;
  }
}
