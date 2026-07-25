# Prompt para Codex - Frontend Ionic Angular AppSolicitudAprobacion

Quiero integrar en este proyecto Ionic Angular el frontend completo para el modulo de solicitudes de aprobacion de precios contra el backend existente `AppSolicitudAprobacion`.

Antes de modificar, inspecciona la estructura actual del proyecto Ionic Angular:

- version de Angular/Ionic
- si usa standalone components o NgModules
- estructura de paginas, servicios, guards, interceptors, environments
- estilo visual existente
- patron actual para `HttpClient`, loading, toast, alert, navegacion y manejo de errores
- modulos existentes de cotizacion, cotizacion general, detalle de cotizacion, detalle de producto o productos cotizados

Respeta los patrones existentes del proyecto. No introduzcas librerias nuevas salvo que sean estrictamente necesarias.

## Backend

Base path:

```txt
/api/appsolicitudaprobacion
```

Todos los endpoints son `POST`.

La respuesta general del backend usa este wrapper:

```ts
export interface ResultDto<T> {
  data: T | null;
  isValid: boolean;
  linkData: string;
  linkDataArlternative: string;
  message: string;
  page: number;
  totalPage: number;
  cantidadRegistros: number;
  total1: number;
  descripcionTotal1: string;
  total2: number;
  descripcionTotal2: string;
  total3: number;
  descripcionTotal3: string;
  total4: number;
  descripcionTotal4: string;
  meta?: any;
}
```

Nota: si el backend devuelve propiedades en PascalCase por configuracion de ASP.NET, adapta los modelos o normaliza la respuesta. Verifica con el patron existente del proyecto.

## Modelo principal

```ts
export interface AppSolicitudAprobacion {
  id: number;
  cotizacion: string;
  codigoProducto: string;
  appProductId: number;
  appGeneralQuotesId: number;
  appDetailQuotesId: number;
  cantidad: number | null;
  precioVenta: number;
  totalVenta: number | null;
  precioMinimo: number;
  precioMaximo: number;
  porcentajeSobrePrecio: number;
  codigoCondicionPago: number | null;
  condicionPago: string | null;
  observacionSolicitante: string;
  observacionAprobador: string | null;
  usuarioSolicitante: string | null;
  usuarioAprobador: string | null;
  aprobado: boolean;
  rechazado: boolean;
  fechaAprobado: string | null;
  fechaRechazado: string | null;
  oficina: number;
  nombreOfiicina: string | null;
  vendedor: string;
  nombreVendedor: string | null;
  codigoCliente: string;
  razonSocial: string;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaActualizacion: string | null;
  usuarioActualizacion: string | null;
}
```

## Endpoints a implementar

Crea un servicio Angular/Ionic llamado, segun convencion del proyecto, algo como `AppSolicitudAprobacionService`.

Usa el `apiUrl` existente en `environment.ts` / `environment.prod.ts`. Si no existe, crea una propiedad clara como:

```ts
apiUrl: 'https://localhost:xxxx'
usa del servicio  GeneralService.basePathVertical
```

No hardcodees la URL dentro del servicio.

### 1. Listado paginado

`POST /api/appsolicitudaprobacion/getAllPaged`

Body:

```ts
export interface GetAllPagedAppSolicitudAprobacionQuery {
  fechaDesde: string;
  fechaHasta: string;
  usuarioConectado: string;
  pageSize: number;
  pageNumber: number;
  searchText: string;
}
```

Response:

```ts
ResultDto<AppSolicitudAprobacion[]>;
```

### 2. Listado de pendientes

`POST /api/appsolicitudaprobacion/listSolicitudesPendientes`

Body:

```ts
{
}
```

Response:

```ts
ResultDto<AppSolicitudAprobacion[]>;
```

### 3. Obtener por Id

`POST /api/appsolicitudaprobacion/getById`

Body:

```ts
{
  id: number;
}
```

Response:

```ts
ResultDto<AppSolicitudAprobacion>;
```

### 4. Obtener por cotizacion y producto

`POST /api/appsolicitudaprobacion/solicitudByCotizacionProducto`

Body:

```ts
{
  cotizacion: string;
  codigoProducto: string;
}
```

Response:

```ts
ResultDto<AppSolicitudAprobacion>;
```

### 5. Crear solicitud desde detalle de cotizacion

`POST /api/appsolicitudaprobacion/createFromDetailQuote`

Body:

```ts
export interface CreateFromDetailQuoteAppSolicitudAprobacionCommand {
  cotizacion: string;
  codigoProducto: string;
  usuarioSolicitante: string;
  observacionSolicitante: string;
}
```

Response:

```ts
ResultDto<AppSolicitudAprobacion>;
```

### 6. Aprobar solicitud

`POST /api/appsolicitudaprobacion/aprobar`

Body:

```ts
export interface AprobarRechazarAppSolicitudAprobacionCommand {
  cotizacion: string;
  producto: string;
  usuarioAprobador: string;
}
```

Importante: el backend espera `producto`, pero representa el codigo de producto.

Response:

```ts
ResultDto<AppSolicitudAprobacion>;
```

### 7. Rechazar solicitud

`POST /api/appsolicitudaprobacion/rechazar`

Body igual a aprobar:

```ts
{
  cotizacion: string;
  producto: string;
  usuarioAprobador: string;
}
```

Response:

```ts
ResultDto<AppSolicitudAprobacion>;
```

### 8. Eliminar solicitud

`POST /api/appsolicitudaprobacion/delete`

Body:

```ts
{
  id: number;
}
```

Response:

```ts
export interface DeleteAppSolicitudAprobacionResponse {
  deleted: boolean;
}

ResultDto<DeleteAppSolicitudAprobacionResponse>;
```

### 9. Crear solicitud completa

`POST /api/appsolicitudaprobacion/create`

Body:

```ts
export interface CreateAppSolicitudAprobacionCommand {
  cotizacion: string;
  codigoProducto: string;
  appProductId: number;
  appGeneralQuotesId: number;
  appDetailQuotesId: number;
  cantidad: number | null;
  precioVenta: number;
  totalVenta: number | null;
  precioMinimo: number;
  precioMaximo: number;
  porcentajeSobrePrecio: number;
  codigoCondicionPago: number | null;
  condicionPago: string | null;
  observacionSolicitante: string;
  observacionAprobador: string | null;
  usuarioSolicitante: string | null;
  usuarioAprobador: string | null;
  aprobado: boolean;
  rechazado: boolean;
  fechaAprobado: string | null;
  fechaRechazado: string | null;
  oficina: number;
  nombreOfiicina: string | null;
  vendedor: string;
  nombreVendedor: string | null;
  codigoCliente: string;
  razonSocial: string;
  usuarioCreacion: string;
}
```

### 10. Actualizar solicitud completa

`POST /api/appsolicitudaprobacion/update`

Body igual al create, pero agrega:

```ts
id: number;
usuarioActualizacion: string;
```

No incluye `usuarioCreacion`.

## Servicio esperado

El servicio debe tener metodos con tipos fuertes:

```ts
getAllPaged(query: GetAllPagedAppSolicitudAprobacionQuery): Observable<ResultDto<AppSolicitudAprobacion[]>>;
listPendientes(): Observable<ResultDto<AppSolicitudAprobacion[]>>;
getById(id: number): Observable<ResultDto<AppSolicitudAprobacion>>;
getByCotizacionProducto(cotizacion: string, codigoProducto: string): Observable<ResultDto<AppSolicitudAprobacion>>;
createFromDetailQuote(command: CreateFromDetailQuoteAppSolicitudAprobacionCommand): Observable<ResultDto<AppSolicitudAprobacion>>;
aprobar(command: AprobarRechazarAppSolicitudAprobacionCommand): Observable<ResultDto<AppSolicitudAprobacion>>;
rechazar(command: AprobarRechazarAppSolicitudAprobacionCommand): Observable<ResultDto<AppSolicitudAprobacion>>;
delete(id: number): Observable<ResultDto<DeleteAppSolicitudAprobacionResponse>>;
```

## Funcionalidad frontend requerida

Implementa una experiencia completa para aprobacion de solicitudes.

### 1. Pagina principal de solicitudes de aprobacion

Ruta sugerida:

```txt
/solicitudes-aprobacion
```

O usa la convencion existente del proyecto.

Debe mostrar listado paginado usando `getAllPaged`.

Filtros:

- fecha desde
- fecha hasta
- busqueda libre `searchText`
- selector de page size si el proyecto ya usa ese patron

Cargar inicialmente un rango razonable, por ejemplo mes actual, salvo que el proyecto tenga otro criterio.

Usar `usuarioConectado` desde el mecanismo de autenticacion/sesion existente. Si no existe, crear una funcion temporal centralizada tipo `getCurrentUser()` o usar el patron actual del proyecto.

### 2. Vista de pendientes

Puede ser una pestana/segmento dentro de la misma pagina: `Todas` y `Pendientes`.

La pestana `Pendientes` debe consumir `listSolicitudesPendientes`.

Una solicitud esta pendiente cuando:

```ts
solicitud.aprobado === false && solicitud.rechazado === false;
```

### 3. Tarjetas o tabla responsive

Mostrar como minimo:

- cotizacion
- codigo producto
- razon social
- vendedor / nombre vendedor
- precio venta
- precio minimo
- precio maximo
- porcentaje sobre precio
- cantidad
- total venta
- condicion de pago
- observacion solicitante
- estado: pendiente, aprobada o rechazada
- fechas de creacion, aprobacion o rechazo cuando apliquen

Usa formato local para moneda, numeros y fechas.

Mantener diseno consistente con Ionic:

- `ion-list`
- `ion-item`
- `ion-card`
- `ion-grid`
- `ion-chip`
- `ion-segment`
- `ion-modal`
- `ion-alert`

O componentes equivalentes ya usados por el proyecto.

No hagas una landing page. Debe ser una pantalla de trabajo real.

### 4. Acciones por solicitud

Para cada solicitud pendiente:

- boton aprobar
- boton rechazar
- boton ver detalle

Al aprobar:

- pedir confirmacion con `ion-alert` o modal existente
- llamar endpoint `/aprobar`
- enviar `{ cotizacion, producto: codigoProducto, usuarioAprobador }`
- refrescar listado
- mostrar toast con `message` del backend

Al rechazar:

- pedir confirmacion
- llamar endpoint `/rechazar`
- enviar `{ cotizacion, producto: codigoProducto, usuarioAprobador }`
- refrescar listado
- mostrar toast con `message` del backend

Nota: el endpoint de rechazar actualmente no recibe observacion de aprobador. Si disenas UI con observacion, dejala deshabilitada o no la incluyas en el request, y agrega comentario `TODO` indicando que el backend deberia aceptar `observacionAprobador` si se requiere.

### 5. Detalle de solicitud

Crear un modal o pagina detalle que muestre todos los datos importantes de la solicitud.

Desde el detalle permitir aprobar/rechazar si esta pendiente.

### 6. Integracion con cotizacion/detalle existente

El proyecto frontend ya tiene pantallas o componentes relacionados con cotizacion/detalle. Debes buscarlos antes de crear cualquier flujo nuevo.

Busca en el proyecto nombres y rutas relacionados con:

- `cotizacion`
- `cotizaciones`
- `quote`
- `quotes`
- `general quote`
- `appgeneralquote`
- `detail quote`
- `appdetailquotes`
- `detalle`
- `producto`
- `productos`
- `precio`
- `aprobacion`
- `solicitud`

Objetivo de integracion:

- En la pantalla de detalle de cotizacion o en cada item/producto cotizado, agregar la accion `Enviar a aprobacion` cuando aplique.
- Usa los flags o propiedades existentes del detalle si ya existen. En el backend de cotizaciones aparecen conceptos como:
  - `EnviarAprobacionPrecio`
  - `EliminarSolicitudPrecio`
  - `StatusAprobacionDto`
  - `ObsSolicitud`
  - `MensajeSolicitudEstimada`
- Si estos campos ya existen en los modelos frontend, reutilizalos.
- Si no existen pero vienen del backend, actualiza los modelos del frontend siguiendo el contrato actual.

Comportamiento esperado desde cotizacion/detalle:

1. El usuario abre una cotizacion existente.
2. En cada producto/detalle donde el precio requiera aprobacion, mostrar una accion clara: `Enviar a aprobacion`.
3. Al pulsar la accion, pedir una observacion obligatoria del solicitante.
4. Llamar:

```txt
POST /api/appsolicitudaprobacion/createFromDetailQuote
```

Con body:

```ts
{
  cotizacion: detalle.cotizacion || cotizacionActual.cotizacion,
  codigoProducto: detalle.codigoProducto || detalle.producto || detalle.codigo,
  usuarioSolicitante: usuarioConectado,
  observacionSolicitante: observacionIngresada
}
```

5. Mostrar el `message` del backend.
6. Refrescar la cotizacion/detalle o actualizar el estado local del producto.
7. Si la solicitud ya existe, mostrar el mensaje del backend sin duplicar UI.

Tambien en el detalle de cotizacion:

- Mostrar el estado de aprobacion del producto si existe `StatusAprobacionDto`.
- Si esta pendiente, mostrar chip `Pendiente`.
- Si esta aprobado, mostrar chip `Aprobado`.
- Si esta rechazado, mostrar chip `Rechazado`.
- Si existe `MensajeSolicitudEstimada`, mostrarlo cerca del item/producto.
- Si existe `ObsSolicitud`, mostrarla como observacion de solicitud.

No dupliques paginas de cotizacion. Integra esta accion en el flujo existente.

Si no encuentras una pantalla clara de cotizacion/detalle:

- implementa el servicio y la pagina de solicitudes de aprobacion
- deja una funcion publica reutilizable para `createFromDetailQuote`
- agrega una nota en el resumen final indicando exactamente que no se encontro el punto de integracion de cotizacion/detalle

### 7. Crear solicitud desde cotizacion/producto

Implementa una accion reutilizable, preferiblemente desde un modal o metodo de servicio, para crear una solicitud desde detalle:

- `cotizacion`
- `codigoProducto`
- `usuarioSolicitante`
- `observacionSolicitante`

Valida que `observacionSolicitante` sea obligatoria.

Endpoint:

```txt
POST /api/appsolicitudaprobacion/createFromDetailQuote
```

### 8. Manejo de errores

- Si `isValid` viene en `false`, mostrar `message` del backend.
- Si falla HTTP, mostrar error amigable y log tecnico solo en consola.
- Usar loading/spinner durante operaciones.
- Evitar doble click en aprobar/rechazar/enviar a aprobacion mientras se procesa.

## Tipos y organizacion

Crea tipos TypeScript en una ubicacion coherente, por ejemplo:

```txt
src/app/models/app-solicitud-aprobacion.model.ts
```

O donde el proyecto tenga sus modelos.

Crea servicio:

```txt
src/app/services/app-solicitud-aprobacion.service.ts
```

O la ubicacion equivalente existente.

## Validacion visual y pruebas

Despues de implementar:

- ejecuta build o test disponible: `npm run build`, `ionic build`, o el script real del proyecto
- corrige errores TypeScript
- si hay lint, ejecutalo si el proyecto lo usa
- inicia servidor local si corresponde y verifica la pantalla en navegador
- revisa que no haya textos desbordados en mobile
- revisa estados: loading, vacio, error, pendiente, aprobada, rechazada
- verifica el flujo desde cotizacion/detalle hacia `createFromDetailQuote`

## Criterios de aceptacion

- Existe una pantalla funcional para listar solicitudes de aprobacion.
- Puedo filtrar por fechas y texto.
- Puedo cambiar entre todas y pendientes.
- Puedo ver detalle de una solicitud.
- Puedo aprobar una solicitud pendiente.
- Puedo rechazar una solicitud pendiente.
- Desde cotizacion/detalle puedo enviar un producto a aprobacion usando `createFromDetailQuote`.
- La UI muestra el estado de aprobacion en el detalle de cotizacion/producto cuando el backend provee esa informacion.
- La UI muestra mensajes del backend.
- El codigo compila sin errores TypeScript.
- Los modelos coinciden con el contrato del backend.
- No se rompen patrones existentes del proyecto.
