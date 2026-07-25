# Plan para compactar formulario de detalle de cotizacion

## Objetivo

Organizar el formulario de mantenimiento de detalle para que, al entrar, se vea el detalle cargado y se reduzca la cantidad de filas visibles sin alterar el flujo funcional ni la logica de calculo.

## Principios

- Mantener el orden del flujo: producto, unidad, cantidades, precio, aprobacion, observaciones y guardado.
- No modificar reglas de negocio, calculos, validaciones ni payloads.
- Hacer el cambio principalmente en plantilla y estilos.
- Mostrar campos condicionales solo cuando aplican.
- Dar prioridad visual al detalle activo y a la lista inferior.

## Cambios visuales

1. Combinar `Orden Anterior`, `Condicion de Pago` y `Categoria` en una sola fila responsive.
2. Combinar `Descripcion del Producto` y `Unidad de Medida` en una sola fila responsive.
3. Combinar medidas y cantidades en una sola fila responsive:
   - Medida basica y opuesta solo si el producto requiere datos de entrada.
   - Cantidad solicitada y cantidad de produccion siempre dentro del mismo bloque.
4. Combinar `Precio US$`, `Total US$` y `Dias de Entrega` en una sola fila.
5. Reducir altura inicial de textareas no criticas.
6. Mantener los estados de aprobacion y sobreprecio debajo del resumen de precio.
7. Mantener la lista inferior visible mas cerca del primer viewport.
8. En pantallas anchas, convertir la lista en un panel lateral visible desde el primer viewport.

## Validacion

- Compilar con `npx ng build`.
- Verificar que la pantalla sigue cargando el primer detalle por defecto.
- Verificar que nuevo, editar, eliminar y guardar siguen apuntando a los mismos metodos.
