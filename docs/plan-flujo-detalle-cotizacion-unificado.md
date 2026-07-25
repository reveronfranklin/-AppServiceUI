# Plan de flujo unificado de detalle de cotizacion

## Objetivo

Unificar el mantenimiento de productos de una cotizacion en una sola pantalla, de forma que el usuario pueda ver y gestionar en el mismo lugar:

- La informacion general de la cotizacion seleccionada.
- El formulario de creacion o edicion del producto.
- La lista de productos ya cargados en la cotizacion.

La pantalla debe poder abrirse desde el general de cotizacion y desde la lista general de cotizaciones.

## Flujo propuesto

1. Al entrar a mantenimiento de detalle, cargar la cotizacion activa desde el estado compartido.
2. Si la cotizacion tiene detalles, seleccionar por defecto el primer registro y cargarlo en el formulario en modo edicion.
3. Si la cotizacion no tiene detalles, inicializar el formulario en modo creacion.
4. Mostrar la lista de productos debajo del formulario.
5. Permitir editar un producto desde la lista sin cambiar de pantalla.
6. Permitir crear un producto nuevo desde la misma pantalla con el boton `Nuevo Producto`.
7. Permitir eliminar productos desde la lista y refrescar la cotizacion activa.
8. Al crear un detalle, refrescar la lista y dejar el nuevo detalle seleccionado en modo edicion.
9. Al actualizar un detalle, refrescar la lista y mantener ese detalle seleccionado.
10. Al eliminar el detalle seleccionado, cargar el primer detalle restante; si no queda ninguno, pasar a modo creacion.

## Entradas a la pantalla

- Desde el general de cotizacion: el boton de detalle debe abrir directamente la pantalla de mantenimiento unificado.
- Desde la lista general de cotizaciones: debe existir una accion para abrir directamente el mantenimiento de detalle de la cotizacion seleccionada.
- La ruta historica de lista de detalle puede redirigir al mismo mantenimiento unificado para no romper navegaciones existentes.

## Responsabilidades de la pantalla unificada

- Mantener la cotizacion activa.
- Mantener el detalle seleccionado.
- Mantener el modo actual: creacion o edicion.
- Orquestar el refresco de la lista despues de crear, actualizar o eliminar.
- Cargar automaticamente el primer detalle cuando exista.
- Conservar la logica vigente de precio, flete, aprobacion de precio y aprobacion por sobreprecio.

## Documentacion a actualizar

- Documentacion funcional del detalle de cotizaciones.
- Documentacion tecnica del detalle de cotizaciones.
- Documentacion visible de reglas funcionales en la pantalla.
