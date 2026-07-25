# Reglas funcionales - EditPage detalle de cotizaciones

Documento generado a partir del comportamiento de la pantalla `EditPage` del detalle de cotizaciones. Describe las reglas desde la perspectiva de negocio y operacion funcional.

## Alcance

La pantalla permite crear o modificar un producto dentro del detalle de una cotizacion. Administra seleccion de producto, unidad de venta, conversion de cantidades, calculo de precio, flete, totales, validaciones, solicitud de aprobacion por precio, solicitud de aprobacion por sobreprecio y restricciones segun el estado del detalle.

## Flujo unificado de mantenimiento

- El mantenimiento de detalle muestra el formulario de producto y la lista de productos de la cotizacion en una sola pantalla.
- La pantalla puede abrirse desde el general de cotizacion o desde la lista general de cotizaciones.
- Si la cotizacion tiene productos, el primer producto se carga automaticamente en el formulario en modo edicion.
- Si la cotizacion no tiene productos, el formulario inicia en modo creacion.
- El boton de nuevo producto limpia el formulario y prepara la creacion de otro detalle sin salir de la pantalla.
- Al presionar editar en la lista inferior, el producto se carga en el formulario sin navegar a otra pantalla.
- Al crear, actualizar o eliminar un producto, la lista inferior se refresca con los datos actuales de la cotizacion.
- Si se elimina el producto activo, se carga el primer producto restante; si no queda ninguno, el formulario vuelve a modo creacion.
- Una cotizacion puede tener como maximo 5 productos. Al llegar al limite, no se permite iniciar ni guardar un producto adicional.

## Organizacion compacta del formulario

- El formulario conserva el orden funcional del flujo, pero agrupa campos relacionados en menos filas.
- Orden anterior, condicion de pago y categoria se presentan en la misma franja cuando aplica.
- Descripcion comercial y unidad de medida se presentan en una misma franja.
- Medidas y cantidades se presentan en una misma franja; las medidas solo aparecen cuando el producto requiere datos de entrada.
- Precio, total y dias de entrega se presentan en una misma franja.
- Las especificaciones de etiquetas prime se muestran como una seccion compacta solo para la subcategoria correspondiente.
- Las observaciones usan una altura inicial menor para acercar la lista de productos al primer viewport.
- En pantallas anchas, la lista de productos se presenta como panel lateral para que sea visible desde el primer vistazo sin bajar al final del formulario.

## Modo crear y modo editar

- Si la operacion es crear, la pantalla inicializa un detalle nuevo sin producto, sin unidad, sin precio y con estatus de aprobacion por defecto como aprobado.
- Si la operacion es editar, la pantalla carga el detalle existente con producto, unidad, cantidad, precio, observaciones, medidas, condicion de pago, flete, estatus de aprobacion y datos de conversion.
- Si la operacion es editar, no se permite cambiar el producto asociado al item. El identificador del producto (`idProducto`) queda bloqueado como identidad del detalle.
- En edicion, la descripcion comercial del producto si puede modificarse. Esta descripcion corresponde al texto mostrado al cliente y no cambia el producto maestro asociado.
- Si el usuario selecciono un producto errado, debe eliminar el item y crear uno nuevo con el producto correcto.
- Si el detalle tiene `idEstatus >= 5`, se considera un detalle ganado o no modificable; no debe disparar aprobacion ni recalculo normal de precio.
- La moneda operativa de la pantalla queda forzada a dolares.
- El boton de nuevo producto queda deshabilitado cuando la cotizacion ya tiene 5 productos.

## Seleccion de subcategoria, producto y unidad

- Al cambiar la subcategoria se limpian producto, descripcion, nombre comercial, unidad, conversion e identificadores internos.
- Al seleccionar producto se cargan sus datos maestros: codigo, descripcion, imagen, unidad productiva, conversion por defecto, precios por rango y si requiere datos de entrada.
- La seleccion de subcategoria y producto solo esta disponible en modo creacion. En modo edicion se muestra el producto actual como referencia, pero no se permite reemplazarlo.
- La descripcion comercial permanece editable en modo edicion para ajustar el texto de la cotizacion sin modificar `idProducto`.
- Si el producto no requiere datos de entrada, las medidas `medidaBasica` y `medidaOpuesta` se fijan en `0`.
- Al seleccionar una unidad distinta a la anterior, el precio en USD se reinicia en `0` y se dispara un recalculo diferido.

## Cantidades y conversiones

- `cantidadSolicitada` representa la cantidad comercial solicitada por el usuario.
- `cantidad` representa la cantidad convertida usada para calculo y totalizacion.
- Para productos con conversion generica, la cantidad se calcula usando la relacion `xNumerador / yDenominador`.
- Para productos que requieren largo y ancho, la cantidad se calcula usando parametros de maquina desde `localStorage`; si no existen, se usan valores por defecto.
- Para productos de `tipoCalculo === 4` con unidad `615`, la cantidad se fuerza a `cantidadSolicitada / 1000`.

## Calculo de precios

- La pantalla usa el precio base con flete como valor de referencia para comparar contra el precio de venta.
- El precio base con flete corresponde al valor visible en la alerta de estimacion (`concesionString`), calculado internamente como `newPrecioMasFlete`.
- El precio base se compone normalmente de precio base de produccion mas flete.
- El flete se calcula como porcentaje sobre el precio base de produccion.
- En calculos por rango puede prevalecer el porcentaje de flete del producto si es mayor a cero.
- Si existe precio maximo con flete desde API, se usa para derivar el flete maximo; si no, se calcula con el porcentaje de flete.
- Para rangos locales, el precio se toma del primer rango donde la cantidad este entre `desde` y `hasta`; si no hay coincidencia, se usa el primer precio disponible.

## Tipos de calculo

- `tipoCalculo === 1`: requiere cantidad solicitada, medida basica y medida opuesta; calcula conversion por largo/ancho.
- `tipoCalculo === 2`: recalcula por rango usando conversion generica y precios locales del producto.
- `tipoCalculo === 3`: consulta precio por producto y cantidad contra la API.
- `tipoCalculo === 4`: requiere cantidad solicitada, medida basica y medida opuesta; consulta precio por producto/cantidad/largo/ancho. Si la unidad es `615`, aplica conversion a millar.
- `tipoCalculo === 5`: consulta precio por producto/cantidad para rollos.
- `tipoCalculo === 6`: etiqueta prime; usa la misma ruta de precio por producto/cantidad/largo/ancho.
- `tipoCalculo === 12`: usa la misma ruta de precio por producto y cantidad que el tipo `3`.

## Totales y moneda

- `totalUsd` se calcula como `precioUsd * cantidad`.
- `precio` en bolivares se calcula como `precioUsd * tasa` cuando hay tasa disponible y cambia el precio USD.
- `total` se calcula como `precioUsd * tasa * cantidad`.
- Para `tipoCalculo === 4` y unidad `615`, los totales usan `cantidadSolicitada / 1000`.

## Aprobacion por precio

- La pantalla requiere aprobacion de precio cuando ocurre al menos una de estas condiciones:
  - El precio de venta esta por debajo del precio base con flete.
  - El producto requiere estimacion.
  - La API indica que esta por debajo de cantidad minima.
- Cuando requiere aprobacion de precio, se activa la solicitud de precio, el color de la barra pasa a estado de alerta y se muestra el mensaje para enviar aprobacion.
- Si el producto requiere estimacion, el mensaje cambia a aprobacion por estimacion e incluye el codigo del producto.
- Para guardar con aprobacion de precio se exige observacion.
- Cuando el producto requiere estimacion, la observacion enviada al backend se prefija con `***SOLICITUD DE ESTIMACION****`.

## Sobre margen y sobreprecio

- La pantalla calcula la concesion comparando el precio base con flete contra el precio de venta.
- Si la concesion es negativa, se interpreta como sobre margen y se muestra como `+N% de sobre margen`.
- Si la concesion es positiva, se interpreta como descuento y se muestra como `-N% de descuento`.
- Si la diferencia es cero, se muestra `0% de descuento`.
- Se permite enviar aprobacion por sobreprecio solo cuando el sobre margen supera el porcentaje maximo configurado para el producto.
- Para productos cotizados por `GetPrice`, el maximo se toma de `porcMaximoSobrePrecio` en la respuesta de `GetPrice`.
- Para productos generales, el maximo se toma de `porcMaximoSobrePrecio` en la lista de precios del producto, usando el rango que corresponde a la cantidad calculada.
- El porcentaje de sobreprecio se calcula asi:

```text
porcentajeSobreprecio = ((precioVentaUsd - precioBaseConFlete) / precioBaseConFlete) * 100
```

- Si el precio base con flete es menor o igual a cero, el porcentaje de sobreprecio es `0`.
- Si el precio de venta es menor o igual al precio base con flete, el porcentaje de sobreprecio es `0`.
- Para enviar aprobacion por sobreprecio se exige:
  - Que el sobre margen sea mayor a `porcMaximoSobrePrecio`.
  - Que el detalle ya tenga identificador; si no, primero debe guardarse el producto.
  - Que exista observacion de sobreprecio.
  - Que el producto tenga codigo externo.
- Antes de enviar la solicitud de sobreprecio, la pantalla guarda el detalle actualizado.
- Si la solicitud se crea correctamente, el detalle queda con observacion de sobreprecio y estatus local `PENDIENTE`.

## Validaciones al guardar

- `diasEntrega` debe ser mayor que cero.
- En actualizacion, el `idProducto` actual debe coincidir con el `idProducto` original del detalle. Si cambia, se bloquea el guardado y se indica que el item debe eliminarse y crearse nuevamente.
- La validacion anterior no aplica a la descripcion comercial: el campo `nombreComercialProducto` puede cambiarse y guardarse sin alterar el producto asociado.
- Para productos `tipoCalculo === 1` y `tipoCalculo === 4`, `medidaBasica` y `medidaOpuesta` deben ser mayores que cero.
- Si requiere aprobacion de precio, la observacion de solicitud es obligatoria.
- Para productos de subcategoria `9`, se exige:
  - `salida` obligatoria.
  - `forma` obligatoria.
  - `presentacion` con longitud mayor a 5 caracteres.
- Si existe un precio aprobado, el precio de venta no puede ser menor a ese valor.
- Al guardar, si la operacion es crear se inserta el detalle; si es editar se actualiza.

## Guardado y actualizacion

- En insercion, el detalle se crea con `idEstatus = 1`.
- En actualizacion, se envia el `idProducto` original del item existente; no se toma un producto nuevo desde la pantalla.
- Tanto en insercion como en actualizacion se envia:
  - Producto y unidad seleccionados.
  - Cantidad solicitada y cantidad convertida.
  - Precio, precio USD y totales.
  - Precio lista/base de produccion.
  - Solicitud de precio y observaciones.
  - Medidas, forma, salida y presentacion.
  - Calculo asociado.
  - Precio maximo de produccion.
  - Usuario conectado.
- Si la API devuelve mensaje de solicitud de precio, se muestra una alerta indicando que la cotizacion fue enviada para aprobacion.
- Si la operacion es exitosa, se actualiza la cotizacion y se refresca la lista de productos en la misma pantalla.
