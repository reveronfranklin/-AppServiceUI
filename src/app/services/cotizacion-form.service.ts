import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppDetailQuotesGetDto } from '../models/app-detail-quotes-get-dto';
import { AppGeneralQuotesGetDto } from '../models/app-general-quotes-get-dto';
import { AppDetailQuotesCreateDto } from '../models/app-detail-quotes-create-dto';
import { AppDetailQuotesUpdateDto } from '../models/app-detail-quotes-update-dto';
import { AppProductsGetDto } from '../models/app-products-get-dto';

@Injectable({
  providedIn: 'root'
})
export class CotizacionFormService {

  constructor(private fb: FormBuilder) { }

  buildForm(): FormGroup {
    return this.fb.group({
      producto: ['', [Validators.required]],
      nombreComercialProducto: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(200),
        ],
      ],
      unidad: ['', [Validators.required, Validators.minLength(2)]],
      cantidad: [0, [Validators.required, Validators.min(0.00000000001)]],
      precio: [0, []],
      total: ['', [Validators.required]],
      precioUsd: [0, [Validators.required, Validators.min(0.00000000001)]],
      totalUsd: ['', [Validators.required]],
      diasEntrega: [0, [Validators.required, Validators.min(1)]],
      observaciones: ['', [Validators.maxLength(200)]],
      obsSolicitud: ['', []],
      cantidadSolicitada: [0, Validators.required],
      condicionPago: [40, [Validators.required]],
      subCategoriaId: ['', []],
      descripcionProducto: ['', []],
      medidaBasica: ['', []],
      medidaOpuesta: ['', []],
      ordenAnterior: ['', []],
      cantidadConvertidaAlternativa: [0],
      forma: ['', []],
      salida: ['', []],
      presentacion: ['', [Validators.maxLength(200)]],
      mensajeSolicitarPrecio: ['', []],
      estimada: [false, []],
    });
  }

  mapDataToForm(form: FormGroup, item: AppDetailQuotesGetDto, cotizacion: AppGeneralQuotesGetDto, operacion: number) {
    if (operacion === 1) { // Edit
      form.patchValue({
        estimada: item.estimada,
        mensajeSolicitarPrecio: item.mensajeSolicitarPrecio || '',
        condicionPago: cotizacion.idCondPago,
        unidad: item.appUnitsGetDto?.description1 || '',
        ordenAnterior: cotizacion.ordenAnterior,
        producto: item.appProductsGetDto?.code || '',
        descripcionProducto: item.appProductsGetDto?.description1 || '',
        subCategoriaId: item.appProductsGetDto?.appSubCategoryId || '',
        nombreComercialProducto: item.nombreComercialProducto,
        cantidad: item.cantidad,
        cantidadSolicitada: item.cantidadSolicitada,
        precio: item.precio,
        precioUsd: item.precioUsd,
        medidaBasica: item.medidaBasica,
        medidaOpuesta: item.medidaOpuesta,
        total: item.cantidad * item.precio,
        totalUsd: item.cantidad * item.precioUsd,
        diasEntrega: item.diasEntrega,
        observaciones: item.observaciones,
        obsSolicitud: item.obsSolicitud,
        forma: item.forma || '',
        salida: item.salida || '',
        presentacion: item.presentacion || ''
      });
    } else { // New
      form.patchValue({
        condicionPago: cotizacion.idCondPago,
        ordenAnterior: cotizacion.ordenAnterior,
        precio: 1,
        unidad: ''
      });

      if (cotizacion.ordenAnterior > 0 && cotizacion.appOrdenProductoRepeticionGetDto) {
        const rep = cotizacion.appOrdenProductoRepeticionGetDto;
        form.patchValue({
          subCategoriaId: rep.appProductsGetDto.appSubCategoryId,
          producto: rep.appProductsGetDto.code,
          descripcionProducto: rep.appProductsGetDto.description1,
          nombreComercialProducto: rep.nombreForma,
          forma: rep.forma,
          salida: rep.salida,
          presentacion: rep.presentacion,
          unidad: rep.appProductConversionGetDto?.appUnitsAlternativaDescription || '',
          cantidadSolicitada: rep.cantidadOrdenada,
          medidaBasica: rep.medidaBasicaCm,
          medidaOpuesta: rep.medidaOpuestaCm
        });
      }
    }
  }

  mapFormToCreateDto(
    form: FormGroup,
    cotizacion: AppGeneralQuotesGetDto,
    appProduct: AppProductsGetDto,
    uiIdProducto: number,
    uiIdUnidad: number,
    calculoId: number,
    unitPriceBaseProduction: number,
    precioMaximo: number,
    solicitarPrecio: boolean,
    usuarioConectado: string
  ): AppDetailQuotesCreateDto {
    const dto = new AppDetailQuotesCreateDto();
    dto.appGeneralQuotesId = cotizacion.id;
    dto.cotizacion = cotizacion.cotizacion;
    dto.condicionPago = form.get('condicionPago').value;
    dto.idProducto = uiIdProducto;
    dto.idUnidad = uiIdUnidad;
    dto.idEstatus = 1;
    dto.producto = form.get('producto').value;
    dto.nombreComercialProducto = form.get('nombreComercialProducto').value;
    dto.diasEntrega = form.get('diasEntrega').value;
    dto.observaciones = form.get('observaciones').value;
    dto.cantidad = form.get('cantidad').value;
    dto.cantidadSolicitada = form.get('cantidadSolicitada').value;
    dto.precio = form.get('precio').value;
    dto.total = form.get('total').value;
    dto.precioUsd = form.get('precioUsd').value;
    dto.totalUsd = form.get('totalUsd').value;
    dto.precioLista = unitPriceBaseProduction;
    dto.solicitarPrecio = solicitarPrecio;
    dto.obsSolicitud = form.get('obsSolicitud').value;
    if (appProduct?.requiereEstimacion) {
      dto.obsSolicitud = '***SOLICITUD DE ESTIMACION****' + (dto.obsSolicitud || '');
    }
    dto.medidaBasica = form.get('medidaBasica').value;
    dto.medidaOpuesta = form.get('medidaOpuesta').value;
    dto.valorConvertido = form.get('cantidad').value;
    dto.ordenAnterior = form.get('ordenAnterior').value;
    dto.calculoId = calculoId;
    dto.unitPriceBaseProductionMaximo = precioMaximo;
    dto.forma = form.get('forma').value;
    dto.salida = form.get('salida').value;
    dto.presentacion = form.get('presentacion').value;
    dto.usuarioConectado = usuarioConectado;
    return dto;
  }

  mapFormToUpdateDto(
    form: FormGroup,
    item: AppDetailQuotesGetDto,
    cotizacion: AppGeneralQuotesGetDto,
    uiIdProducto: number,
    uiIdUnidad: number,
    calculoId: number,
    unitPriceBaseProduction: number,
    precioMaximo: number,
    solicitarPrecio: boolean,
    usuarioConectado: string,
    eliminarSolicitud: boolean
  ): AppDetailQuotesUpdateDto {
    const dto = new AppDetailQuotesUpdateDto();
    dto.id = item.id;
    dto.eliminarSolicitud = eliminarSolicitud;
    dto.appGeneralQuotesId = cotizacion.id;
    dto.cotizacion = cotizacion.cotizacion;
    dto.idProducto = uiIdProducto;
    dto.idUnidad = uiIdUnidad;
    dto.idEstatus = cotizacion.idEstatus;
    dto.producto = item.producto;
    dto.nombreComercialProducto = form.get('nombreComercialProducto').value;
    dto.condicionPago = form.get('condicionPago').value;
    dto.cantidad = form.get('cantidad').value;
    dto.cantidadSolicitada = form.get('cantidadSolicitada').value;
    dto.precio = form.get('precio').value;
    dto.total = form.get('total').value;
    dto.precioUsd = form.get('precioUsd').value;
    dto.totalUsd = form.get('totalUsd').value;
    dto.precioLista = unitPriceBaseProduction;
    dto.solicitarPrecio = solicitarPrecio;
    dto.obsSolicitud = form.get('obsSolicitud').value;
    if (item.appProductsGetDto?.requiereEstimacion) {
      dto.obsSolicitud = '***SOLICITUD DE ESTIMACION****' + (dto.obsSolicitud || '');
    }
    dto.medidaBasica = form.get('medidaBasica').value;
    dto.medidaOpuesta = form.get('medidaOpuesta').value;
    dto.valorConvertido = form.get('cantidad').value;
    dto.ordenAnterior = form.get('ordenAnterior').value;
    dto.calculoId = calculoId;
    dto.unitPriceBaseProductionMaximo = precioMaximo;
    dto.forma = form.get('forma').value;
    dto.salida = form.get('salida').value;
    dto.presentacion = form.get('presentacion').value;
    dto.observaciones = form.get('observaciones').value;
    dto.diasEntrega = form.get('diasEntrega').value;
    dto.usuarioConectado = usuarioConectado;
    return dto;
  }
}
