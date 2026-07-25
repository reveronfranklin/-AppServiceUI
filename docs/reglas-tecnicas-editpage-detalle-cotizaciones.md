# Reglas tecnicas - EditPage detalle de cotizaciones

Documento generado a partir del codigo de `src/app/pages/Cotizaciones/cotizacion-detalle/edit/edit.page.ts`, su plantilla `edit.page.html`, la ruta historica de lista y las reglas centralizadas en `CotizacionDetalleBusinessRulesService`.

## Componentes y servicios relevantes

- `EditPage`: pantalla principal unificada para crear, editar, listar y eliminar detalles de cotizacion.
- `ListPage`: pantalla historica de lista de detalles; queda como referencia de compatibilidad, mientras la ruta principal de mantenimiento apunta al flujo unificado.
- `CotizacionDetalleBusinessRulesService`: concentra reglas de concesion, sobreprecio, aprobacion de precio, flete maximo, precio con flete, validacion de guardado, totalizacion y estado inicial aprobado.
- `PrecioMasFleteStorageService`: encapsula persistencia temporal del ultimo precio base con flete calculado.
- `CotizacionFormService`: prepara observaciones de solicitud de precio y estimacion.
- `CotizacionCalculatorService`: queda enfocado en calculos de conversion y rangos.

## Estado principal de `EditPage`

- `operacion`: define modo crear (`0`) o editar (`1`).
- `item`: detalle de cotizacion en edicion.
- `cotizacion`: encabezado de cotizacion.
- `appProduct`: producto maestro seleccionado.
- `form`: formulario reactivo con controles de producto, unidad, cantidad, precio, medidas y observaciones.
- `unitPriceBaseProduction`: precio base de produccion.
- `flete`: flete aplicado al precio base.
- `newPrecioMasFlete`: precio base con flete usado para aprobacion por precio, concesion y sobreprecio.
- `precioMaximo` y `fleteMaximo`: referencia de precio maximo/base maximo y su flete.
- `requiereAprobacionPrecio`: bandera para precio bajo, estimacion o cantidad minima.
- `solicitarPrecio`: bandera enviada al backend para solicitud de precio.
- `porDebajoDeCantidadMinima`: bandera recibida desde calculos/API.
- `concesion` y `concesionString`: porcentaje y texto visible de descuento/sobre margen.

## Servicio de reglas de negocio

`CotizacionDetalleBusinessRulesService` expone las siguientes reglas compartidas:

- `calcularConcesion()`: calcula el porcentaje y texto visible de descuento/sobre margen.
- `calcularPorcentajeSobreprecio()`: calcula el porcentaje positivo cuando el precio de venta supera el precio base con flete.
- `puedeEnviarAprobacionPorSobreprecio()`: retorna `true` solo cuando el sobreprecio es mayor al porcentaje maximo configurado para el producto.
- `calcularFleteMaximo()`: calcula el flete maximo desde precio maximo con flete o porcentaje de flete.
- `calcularPrecioConFlete()`: compone precio base con flete.
- `getColorEstatusAprobacion()`: resuelve el color de estado de aprobacion.
- `puedeAgregarProducto()` y `validarCantidadMaximaProductos()`: aplican el limite de 5 productos por cotizacion.
- `validarIdentidadProductoDetalle()`: bloquea cambios de `idProducto` cuando el detalle ya existe.
- `crearEstadoAprobadoInicial()`: crea el estado inicial aprobado para nuevos detalles.
- `prepararObservacionSolicitudPrecio()`: agrega el prefijo de estimacion cuando aplica.
- `evaluarAprobacionPrecio()`: centraliza la decision de aprobacion de precio.
- `evaluarEstadoPrecio()`: devuelve en una sola respuesta la concesion y el estado de aprobacion de precio.
- `validarGuardado()`: centraliza validaciones funcionales antes de persistir.
- `calcularTotalVenta()`: calcula totales respetando reglas especiales de unidad/tipo de calculo.

## Regla tecnica de sobreprecio

La comparacion de sobreprecio usa el mismo valor base que se muestra en la alerta de estimacion de la pantalla, es decir `newPrecioMasFlete`.

```text
porcentajeSobreprecio = ((precioVentaUsd - precioBaseConFlete) / precioBaseConFlete) * 100
```

Implementacion:

- `precioVentaUsd` corresponde al precio de venta actual.
- `precioBaseConFlete` corresponde a `newPrecioMasFlete`.
- Si `precioBaseConFlete <= 0`, retorna `0`.
- Si `precioVentaUsd <= precioBaseConFlete`, retorna `0`.
- La aprobacion por sobreprecio se habilita solo si el resultado es mayor a `porcMaximoSobrePrecio`.
- Para productos cotizados por `GetPrice`, `porcMaximoSobrePrecio` se obtiene desde la respuesta de `GetPrice`.
- Para productos generales, `porcMaximoSobrePrecio` se obtiene desde el rango activo de `appPriceDto`, usando la cantidad calculada del detalle.

## Flujo de inicializacion

- `ngOnInit()` suscribe cotizacion y tasa, carga condiciones de pago, subcategorias y define si el detalle es crear o editar.
- `configuraCreateOrEdit()` inicializa variables UI y estado segun modo.
- `showData()` hidrata el formulario desde `item` o desde orden anterior si aplica.
- `ionViewDidEnter()` vuelve a sincronizar cotizacion y datos de pantalla.
- Las suscripciones se liberan con `destroy$` y `takeUntil` al destruir la pagina.

## Flujo de recalculo

- Los cambios de cantidad, medidas, unidad, precio o condicion de pago disparan `subjectKeyUp`.
- `subjectKeyUp` aplica `debounceTime(1000)` antes de ejecutar `onRecalcular()`.
- `onRecalcular()` decide la estrategia segun `appProduct.tipoCalculo`.
- Cada recalculo actualiza precio base, flete, cantidad convertida, valor temporal de `precio-mas-flete`, totales y banderas de aprobacion.

## Persistencia temporal

- `PrecioMasFleteStorageService` guarda y recupera un `PrecioDto` usando la clave `precio-mas-flete`.
- `setPrecioMasFlete()` usa ese servicio para restaurar el ultimo calculo vigente antes de guardar o validar.
- Si no existe el valor temporal, es `undefined` textual o contiene JSON invalido, se inicializan precios, flete y banderas en cero/falso.

## Guardado

- `onSave()` ejecuta validaciones centralizadas antes de persistir.
- En modo edicion, `onSave()` valida que `uiIdProducto` coincida con `item.idProducto` mediante `validarIdentidadProductoDetalle()`.
- Si la identidad del producto no coincide, se restaura el producto original en pantalla y se bloquea el guardado con un mensaje funcional.
- La construccion de DTO se separa en helpers para creacion y actualizacion.
- `buildCreateDetalleDto()` prepara el payload de insercion.
- `buildUpdateDetalleDto()` prepara el payload de actualizacion usando siempre `item.idProducto`; no toma `uiIdProducto` como fuente para cambiar la identidad del producto.
- `asignarCamposComunesDetalle()` concentra campos compartidos entre insercion y actualizacion.
- `aplicarCotizacionGuardada()` actualiza el observable de cotizacion con la respuesta del backend y reconstruye la lista visible de productos.
- `mostrarResultadoGuardado()` decide la alerta posterior.
- `guardarFormularioAntesDeEnviarSobreprecio()` mantiene el flujo especial de guardar antes de solicitar aprobacion por sobreprecio.

## Identidad de producto en edicion

- `idProducto` es la identidad del producto dentro del detalle y queda inmutable despues de creado el item.
- `nombreComercialProducto` es la descripcion comercial editable; puede cambiarse sin modificar `idProducto`.
- En la plantilla, la busqueda de productos y busqueda general solo se muestran en modo creacion (`operacion === 0`).
- En la plantilla, la subcategoria queda deshabilitada en modo edicion para evitar limpiar o sustituir la identidad del producto.
- `onBuscarProducto()`, `onBuscarProductoGeneral()` y `onChangeSubCategoriaId()` tienen guardas defensivas para impedir cambios de producto cuando `operacion === 1`.
- La validacion tecnica de identidad se ejecuta antes de las demas validaciones funcionales de guardado.
- Si el producto original fue errado, el flujo soportado es eliminar el detalle y crear uno nuevo con el producto correcto.

## Flujo unificado de mantenimiento

- `EditPage` funciona como mantenimiento unificado: muestra el formulario activo y la lista de productos de la cotizacion en la misma pantalla.
- `ngOnInit()` puede recibir cotizacion y detalle por `router state`; si no recibe un detalle explicito, intenta cargar el primer detalle de la cotizacion.
- Si existe al menos un detalle, se carga por defecto el primer registro en modo edicion.
- Si no existe detalle, `nuevoProducto()` inicializa el formulario en modo creacion.
- `detalleItems` contiene los productos de la cotizacion enriquecidos con datos calculados para la lista.
- `detalleSeleccionadoId` identifica visualmente la fila activa.
- `cargarDetalleEnFormulario()` permite editar un producto desde la lista sin navegar fuera de la pantalla.
- `eliminarDetalleDesdeLista()` elimina un producto, refresca la cotizacion y carga el primer detalle restante; si no queda ninguno, inicializa modo creacion.
- `nuevoProducto()` valida el limite de 5 productos antes de cambiar a modo creacion.
- `onInsert()` vuelve a validar el limite antes de enviar el payload de insercion.

## Layout compacto

- La plantilla usa `detalle-form`, `detalle-form-grid` y `compact-row` para reducir filas sin cambiar bindings ni metodos existentes.
- El layout agrupa datos en franjas:
  - orden/condicion/categoria.
  - descripcion/unidad.
  - medidas/cantidades.
  - precio/total/dias de entrega.
- Las secciones condicionales permanecen controladas por las mismas expresiones (`requiereDatosEntrada`, `subCategoryid`, `solicitarPrecio`, `puedeEnviarAprobacionPorSobreprecio()`).
- La compactacion es visual; no modifica DTOs, validaciones ni recalculos.
- En `min-width: 1100px`, `detalle-layout` usa grilla de dos columnas: formulario principal y panel lateral de productos.
- En el panel lateral, la tabla oculta columnas secundarias para priorizar producto, cantidad, precio y acciones dentro del primer viewport.

## Entradas al mantenimiento

- Desde el general de cotizacion, `ListDetalleCotizacion()` navega directamente a `edit-detalle-cotizacion` con la cotizacion activa.
- Desde la lista general de cotizaciones, la accion `Productos` navega directamente a `edit-detalle-cotizacion` con la cotizacion seleccionada.
- La pantalla mantiene compatibilidad con entradas que indiquen explicitamente `operacion` e `item`.

## Integraciones externas

- `CotizacionesListService.InsertDetalleCotizacion()` crea el detalle.
- `CotizacionesListService.UpdateDetalleCotizacion()` actualiza el detalle.
- `ProductoService.getPrice()` obtiene precios desde API para calculos que dependen de producto, cantidad, unidad, condicion de pago, municipio, medidas u orden anterior.
- `CondicionesPagoService.GetAllCondicionPago()` carga condiciones de pago.
- `TasaPreferencialService.GetTasa()` carga la tasa para calculo en bolivares.
- `AppSolicitudAprobacionService.createFromDetailQuote()` crea la solicitud de aprobacion por sobreprecio.

## ListPage

- `ListPage` usa `CotizacionDetalleBusinessRulesService` para evitar reglas duplicadas en plantilla.
- Cada detalle se transforma a `DetalleCotizacionListItem`.
- El view model precomputa:
  - `precioBaseConFlete`.
  - `porcentajeSobreprecio`.
  - `puedeEnviarAprobacionPorSobreprecio`.
  - `statusAprobacionColor`.
- La plantilla consume valores precomputados en vez de ejecutar reglas directamente durante renderizado.

## Puntos de atencion tecnica

- La pantalla depende del valor temporal `precio-mas-flete`; el acceso y tolerancia a datos corruptos queda encapsulado en `PrecioMasFleteStorageService`.
- `isDolar` queda forzado en `true`, por lo que la rama de bolivares parece heredada o secundaria.
- Varias reglas de aprobacion dependen de datos anidados (`statusAprobacionDto`, `appProductsGetDto`, `appProductConversionGetDto`) y deben tolerar valores incompletos desde API.
- El calculo de condicion de pago por rango aplica `pocGapAplicarPrecio` al precio base y al precio maximo.
- Para `tipoCalculo === 4` con unidad `615`, hay reglas especiales en recalculo y totalizacion.

## Referencias de codigo

- Inicializacion: `ngOnInit`, `configuraCreateOrEdit`, `showData`.
- Validacion y guardado: `onSave`, `onInsert`, `onUpdate`.
- Aprobacion por precio: `setColorToolbar`, `evaluarEstadoPrecio`, `enviarAprobacion`.
- Sobreprecio: `puedeEnviarAprobacionPorSobreprecio`, `getPorcentajeSobreprecio`, `enviarAprobacionPorSobreprecio`.
- Precio base/flete: `setPrecioMasFlete`, `calcularFleteMaximo`, `getPrecioMaximoMasFlete`, `PrecioMasFleteStorageService`.
- Recalculos: `onRecalcular`, `recalculoPorRango`, `recalculoPrecioPorProductoCantidad`, `recalculoPrecioPorProductoCantidadLargoAncho`, `recalculoPrecioPorProductoCantidadRollo`, `recalculoRequiereEntradaLargoAncho`.
- Conversiones: `calculoConversionGenerico`, `calculaConversion`.
