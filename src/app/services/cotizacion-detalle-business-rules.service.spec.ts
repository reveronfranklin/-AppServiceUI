import { TestBed } from '@angular/core/testing';
import { CotizacionDetalleBusinessRulesService } from './cotizacion-detalle-business-rules.service';

describe('CotizacionDetalleBusinessRulesService', () => {
  let service: CotizacionDetalleBusinessRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CotizacionDetalleBusinessRulesService);
  });

  it('debe calcular sobre margen cuando el precio de venta supera el precio base', () => {
    const result = service.calcularConcesion(100, 130);

    expect(result.porcentaje).toBe(-30);
    expect(result.texto).toBe('+30% de sobre margen');
  });

  it('debe calcular descuento cuando el precio de venta esta por debajo del precio base', () => {
    const result = service.calcularConcesion(100, 80);

    expect(result.porcentaje).toBe(20);
    expect(result.texto).toBe('-20% de descuento');
  });

  it('debe permitir aprobacion por sobreprecio solo si el sobre margen supera el maximo recibido', () => {
    expect(service.puedeEnviarAprobacionPorSobreprecio(100, 125, 25)).toBeFalse();
    expect(service.puedeEnviarAprobacionPorSobreprecio(100, 125.01, 25)).toBeTrue();
    expect(service.puedeEnviarAprobacionPorSobreprecio(100, 120.01, 20)).toBeTrue();
  });

  it('debe limitar la cotizacion a maximo cinco productos', () => {
    expect(service.puedeAgregarProducto(4)).toBeTrue();
    expect(service.puedeAgregarProducto(5)).toBeFalse();
    expect(service.validarCantidadMaximaProductos(5)).toContain('máximo de 5 productos');
  });

  it('debe permitir adicionar detalle cuando la cotizacion lo permite y no supera el maximo', () => {
    expect(
      service.puedeAdicionarDetalle({
        cantidadItems: 1,
        permiteAdicionarDetalle: true,
      }),
    ).toBeTrue();
  });

  it('debe impedir adicionar detalle cuando la cotizacion no permite mas detalles', () => {
    expect(
      service.puedeAdicionarDetalle({
        cantidadItems: 1,
        permiteAdicionarDetalle: false,
      }),
    ).toBeFalse();

    expect(
      service.validarAdicionarDetalle({
        cantidadItems: 1,
        permiteAdicionarDetalle: false,
      }),
    ).toContain('no permite adicionar');
  });

  it('debe priorizar el mensaje de maximo de productos al validar adicion de detalle', () => {
    expect(
      service.validarAdicionarDetalle({
        cantidadItems: 5,
        permiteAdicionarDetalle: false,
      }),
    ).toContain('máximo de 5 productos');
  });

  it('debe impedir cambiar el producto de un detalle existente', () => {
    const message = service.validarIdentidadProductoDetalle({
      operacion: 1,
      idProductoOriginal: 10,
      idProductoActual: 11,
    });

    expect(message).toContain('No se puede modificar el producto');
  });

  it('debe permitir conservar el mismo producto al editar el detalle', () => {
    const message = service.validarIdentidadProductoDetalle({
      operacion: 1,
      idProductoOriginal: 10,
      idProductoActual: 10,
    });

    expect(message).toBe('');
  });

  it('debe permitir seleccionar producto al crear el detalle', () => {
    const message = service.validarIdentidadProductoDetalle({
      operacion: 0,
      idProductoOriginal: 0,
      idProductoActual: 10,
    });

    expect(message).toBe('');
  });

  it('debe calcular flete maximo desde el precio maximo mas flete cuando existe', () => {
    expect(
      service.calcularFleteMaximo({
        precioMaximo: 100,
        porcFlete: 12,
        precioMaximoMasFlete: 130,
      }),
    ).toBe(30);
  });

  it('debe calcular flete maximo por porcentaje cuando no existe total maximo con flete', () => {
    expect(
      service.calcularFleteMaximo({
        precioMaximo: 100,
        porcFlete: 12,
      }),
    ).toBe(12);
  });

  it('debe calcular precio base con flete', () => {
    expect(
      service.calcularPrecioConFlete({
        precioBase: 100,
        porcFlete: 12,
      }),
    ).toBe(112);
  });

  it('debe truncar precio base con flete a dos decimales', () => {
    expect(
      service.calcularPrecioConFlete({
        precioBase: 10.111,
        porcFlete: 12.345,
      }),
    ).toBe(11.35);
  });

  it('debe truncar el limite sin modificar el precio del consultor', () => {
    expect(service.truncarLimiteComercial(109.2399)).toBe(109.23);
    expect(
      service.evaluarAprobacionPrecio({
        precioBaseConFlete: 109.2399,
        precioVentaUsd: 109.23,
        requiereEstimacion: false,
        porDebajoDeCantidadMinima: false,
        idEstatus: 1,
        aprobado: false,
        flagCerrado: false,
        operacion: 0,
        isBs: false,
      }).requiereAprobacion,
    ).toBeFalse();
  });

  it('debe resolver color de estatus de aprobacion', () => {
    expect(service.getColorEstatusAprobacion('APROBADO')).toBe('success');
    expect(service.getColorEstatusAprobacion('SOLICITUD NO ESTA APROBADA')).toBe(
      'danger',
    );
    expect(service.getColorEstatusAprobacion('RECHAZADO')).toBe('danger');
    expect(service.getColorEstatusAprobacion('PENDIENTE')).toBe('warning');
    expect(service.getColorEstatusAprobacion('')).toBe('medium');
  });

  it('debe crear el estado inicial aprobado para nuevos detalles', () => {
    expect(service.crearEstadoAprobadoInicial()).toEqual({
      flagAprobado: true,
      flagCerrado: false,
      valorVentaAprobar: 0,
      valorVentaAprobarUsd: 0,
      precioEstimacion: 0,
      aprobado: true,
      color: 'primary',
      statusString: 'APROBADO',
    });
  });

  it('debe preparar observacion normal de solicitud de precio', () => {
    expect(
      service.prepararObservacionSolicitudPrecio('Revisar precio', false),
    ).toBe('Revisar precio');
  });

  it('debe marcar observacion como solicitud de estimacion cuando aplica', () => {
    expect(
      service.prepararObservacionSolicitudPrecio('Revisar precio', true),
    ).toBe('***SOLICITUD DE ESTIMACION****Revisar precio');
  });

  it('debe requerir aprobacion de precio cuando el precio venta esta por debajo del precio base', () => {
    const result = service.evaluarAprobacionPrecio({
      precioBaseConFlete: 100,
      precioVentaUsd: 99,
      requiereEstimacion: false,
      porDebajoDeCantidadMinima: false,
      idEstatus: 1,
      aprobado: false,
      flagCerrado: false,
      operacion: 1,
      isBs: false,
    });

    expect(result.requiereAprobacion).toBeTrue();
    expect(result.colorToolbar).toBe('danger');
    expect(result.solicitarPrecio).toBeTrue();
    expect(result.mensajeBotonSolicitarPrecio).toBe(
      'Enviar Aprobación Por Precio y Salvar',
    );
  });

  it('debe marcar aprobado visualmente si la aprobacion esta cerrada', () => {
    const result = service.evaluarAprobacionPrecio({
      precioBaseConFlete: 100,
      precioVentaUsd: 90,
      requiereEstimacion: false,
      porDebajoDeCantidadMinima: false,
      idEstatus: 1,
      aprobado: true,
      flagCerrado: true,
      operacion: 1,
      isBs: false,
    });

    expect(result.requiereAprobacion).toBeFalse();
    expect(result.colorToolbar).toBe('success');
    expect(result.solicitarPrecio).toBeFalse();
  });

  it('no debe requerir aprobacion de precio para detalles no modificables', () => {
    const result = service.evaluarAprobacionPrecio({
      precioBaseConFlete: 100,
      precioVentaUsd: 90,
      requiereEstimacion: true,
      porDebajoDeCantidadMinima: true,
      idEstatus: 5,
      aprobado: false,
      flagCerrado: false,
      operacion: 1,
      isBs: false,
    });

    expect(result.requiereAprobacion).toBeFalse();
    expect(result.colorToolbar).toBe('primary');
    expect(result.solicitarPrecio).toBeFalse();
  });

  it('debe evaluar concesion y aprobacion de precio en una sola regla', () => {
    const result = service.evaluarEstadoPrecio({
      precioBaseConFlete: 100,
      precioVentaUsd: 80,
      requiereEstimacion: false,
      porDebajoDeCantidadMinima: false,
      idEstatus: 1,
      aprobado: false,
      flagCerrado: false,
      operacion: 1,
      isBs: false,
    });

    expect(result.concesion.porcentaje).toBe(20);
    expect(result.concesion.texto).toBe('-20% de descuento');
    expect(result.aprobacion.requiereAprobacion).toBeTrue();
    expect(result.aprobacion.colorToolbar).toBe('danger');
  });

  it('debe exigir medidas para tipos de calculo por largo y ancho', () => {
    const message = service.validarGuardado({
      diasEntrega: 1,
      tipoCalculo: 4,
      medidaBasica: 0,
      medidaOpuesta: 10,
      requiereAprobacionPrecio: false,
      observacionSolicitud: '',
      appSubCategoryId: 1,
      salida: '',
      forma: '',
      presentacion: '',
      precioAprobadoUsd: 0,
      precioVentaUsd: 0,
    });

    expect(message).toBe('Indique Medida Basica y Medida Opuesta');
  });

  it('debe exigir observacion cuando requiere aprobacion de precio', () => {
    const message = service.validarGuardado({
      diasEntrega: 1,
      tipoCalculo: 2,
      medidaBasica: 0,
      medidaOpuesta: 0,
      requiereAprobacionPrecio: true,
      observacionSolicitud: '',
      appSubCategoryId: 1,
      salida: '',
      forma: '',
      presentacion: '',
      precioAprobadoUsd: 0,
      precioVentaUsd: 0,
    });

    expect(message).toBe(
      'Indique observación de solicitud de precios y presione enviar solicitud',
    );
  });

  it('debe impedir guardar por debajo del precio aprobado', () => {
    const message = service.validarGuardado({
      diasEntrega: 1,
      tipoCalculo: 2,
      medidaBasica: 0,
      medidaOpuesta: 0,
      requiereAprobacionPrecio: false,
      observacionSolicitud: '',
      appSubCategoryId: 1,
      salida: '',
      forma: '',
      presentacion: '',
      precioAprobadoUsd: 50,
      precioVentaUsd: 49,
    });

    expect(message).toBe('Precio es menor a el precio Aprobado');
  });

  it('debe calcular total de venta con cantidad y tasa', () => {
    const result = service.calcularTotalVenta({
      precioUsd: 10,
      cantidad: 3,
      cantidadSolicitada: 3000,
      tasa: 35,
      ultimoPrecioUsd: 0,
      tipoCalculo: 2,
      idUnidad: 1,
    });

    expect(result.cantidad).toBe(3);
    expect(result.totalUsd).toBe(30);
    expect(result.total).toBe(1050);
    expect(result.precio).toBe(350);
    expect(result.ultimoPrecioUsd).toBe(10);
    expect(result.actualizarPrecio).toBeTrue();
  });

  it('debe calcular total por millar para etiquetas digitales en unidad 615', () => {
    const result = service.calcularTotalVenta({
      precioUsd: 20,
      cantidad: 5000,
      cantidadSolicitada: 5000,
      tasa: 40,
      ultimoPrecioUsd: 20,
      tipoCalculo: 4,
      idUnidad: 615,
    });

    expect(result.cantidad).toBe(5);
    expect(result.totalUsd).toBe(100);
    expect(result.total).toBe(4000);
    expect(result.actualizarPrecio).toBeFalse();
  });
});
