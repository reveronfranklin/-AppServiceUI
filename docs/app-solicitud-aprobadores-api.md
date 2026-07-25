# AppSolicitudAprobadores API

Modulo para administrar los usuarios aprobadores responsables por oficina.

Base route:

```text
api/appsolicitudaprobadores
```

## DTOs

### AppSolicitudAprobadorResponse

```ts
export interface AppSolicitudAprobadorResponse {
  id: number;
  usuario: string | null;
  oficina: number | null;
  nombreOficina: string | null;
}
```

### ResultDto

Respuesta estandar usada por los endpoints.

```ts
export interface ResultDto<T> {
  data: T | null;
  isValid: boolean;
  message: string;
  cantidadRegistros: number;
  page: number;
  totalPage: number;
  meta?: unknown;
}
```

## Endpoints

### Crear aprobador

```text
POST api/appsolicitudaprobadores/new
```

Request:

```ts
export interface CreateAppSolicitudAprobadorCommand {
  usuario: string;
  oficina: number;
}
```

Example:

```json
{
  "usuario": "BM12",
  "oficina": 1
}
```

Response:

```ts
ResultDto<AppSolicitudAprobadorResponse>;
```

Validaciones:

- `usuario` es requerido.
- `oficina` es requerida.
- `oficina` debe existir en `MtrOficina.COD_OFICINA`.

### Actualizar aprobador

```text
PUT api/appsolicitudaprobadores/edit
```

Request:

```ts
export interface UpdateAppSolicitudAprobadorCommand {
  id: number;
  usuario: string;
  oficina: number;
}
```

Example:

```json
{
  "id": 1,
  "usuario": "BM12",
  "oficina": 2
}
```

Response:

```ts
ResultDto<AppSolicitudAprobadorResponse>;
```

Validaciones:

- `id` es requerido.
- El aprobador debe existir.
- `usuario` es requerido.
- `oficina` es requerida.
- `oficina` debe existir en `MtrOficina.COD_OFICINA`.

### Eliminar aprobador

```text
POST api/appsolicitudaprobadores/delete
```

Request:

```ts
export interface DeleteAppSolicitudAprobadorCommand {
  id: number;
}
```

Example:

```json
{
  "id": 1
}
```

Response:

```ts
export interface DeleteAppSolicitudAprobadorResponse {
  deleted: boolean;
}

ResultDto<DeleteAppSolicitudAprobadorResponse>;
```

Validaciones:

- `id` es requerido.
- El aprobador debe existir.

### Obtener por id

```text
POST api/appsolicitudaprobadores/getById
```

Request:

```ts
export interface GetAppSolicitudAprobadorByIdQuery {
  id: number;
}
```

Example:

```json
{
  "id": 1
}
```

Response:

```ts
ResultDto<AppSolicitudAprobadorResponse>;
```

### Listar paginado

```text
POST api/appsolicitudaprobadores/getAllPaged
```

Request:

```ts
export interface GetAllPagedAppSolicitudAprobadoresQuery {
  pageSize?: number;
  pageNumber?: number;
  searchText?: string;
}
```

Example:

```json
{
  "pageSize": 10,
  "pageNumber": 1,
  "searchText": ""
}
```

Response:

```ts
ResultDto<AppSolicitudAprobadorResponse[]>;
```

Busqueda:

`searchText` filtra por:

- `usuario`
- `oficina`
- `nombreOficina`

### Listar oficinas

```text
POST api/appsolicitudaprobadores/getAllOficinas
```

Request:

```ts
export interface GetAllOficinasQuery {
  searchText?: string;
}
```

Example:

```json
{
  "searchText": ""
}
```

Response:

```ts
export interface OficinaResponse {
  codigoOficina: number;
  nombreOficina: string;
}

ResultDto<OficinaResponse[]>;
```

Fuente:

```sql
SELECT COD_OFICINA, NOM_OFICINA
FROM MtrOficina
```

### Listar usuarios activos

```text
POST api/appsolicitudaprobadores/getAllUsuariosActivos
```

Request:

```ts
export interface GetAllUsuariosActivosQuery {
  searchText?: string;
}
```

Example:

```json
{
  "searchText": ""
}
```

Response:

```ts
export interface UsuarioActivoResponse {
  usuario?: string | null;
  user?: string | null;
  codigoUsuario?: string | null;
  nombreUsuario?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
}

ResultDto<UsuarioActivoResponse[]>;
```

Notas:

- El valor enviado en create/edit sigue siendo el codigo del usuario.
- El frontend acepta `usuario`, `user` o `codigoUsuario` como codigo para tolerar variaciones del DTO de respuesta.

## Mensajes comunes

```text
Success
Usuario es requerido
Oficina es requerida
Id es requerido
La oficina indicada no existe
El aprobador de solicitud no existe
```

## Notas para frontend

- `id` viene desde SQL como `numeric(18,0)`, pero puede manejarse como `number` mientras no exceda el rango seguro de JavaScript.
- `oficina` corresponde a `MtrOficina.COD_OFICINA`.
- `nombreOficina` es informativo y viene desde `MtrOficina.NOM_OFICINA`.
