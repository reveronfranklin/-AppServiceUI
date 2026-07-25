# NaturalPriceQuery - Documentacion funcional y tecnica

## Objetivo funcional

`NaturalPriceQuery` permite que el usuario escriba una consulta de precio en lenguaje natural y que el sistema la convierta en los parametros necesarios para calcular precio con `GetPrice()`.

El endpoint no reemplaza el calculo de precio. Su responsabilidad principal es interpretar el texto, resolver o sugerir los datos de negocio y devolver un payload compatible con `calculoprecio/GetPrice`.

Ejemplo de consulta de usuario:

```text
Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND
```

Resultado funcional esperado:

1. Identificar producto o candidatos de producto.
2. Identificar municipio.
3. Identificar cantidad.
4. Identificar medidas basica y opuesta cuando apliquen.
5. Identificar unidad.
6. Identificar condicion de pago.
7. Armar parametros para consultar `GetPrice()`.
8. Mostrar en Angular precio minimo, precio maximo, total e identificador de calculo.

## Alcance funcional

La pantalla **Consulta Natural de Precios** se usa para acelerar la busqueda de precio sin obligar al usuario a llenar todos los campos manualmente.

El usuario puede:

- Escribir una frase completa de cotizacion.
- Ejecutar interpretacion y busqueda.
- Revisar los parametros resueltos.
- Seleccionar producto candidato si la API no devuelve un producto unico.
- Cambiar municipio manualmente desde el buscador.
- Cambiar condicion de pago, categoria, cantidad o medidas.
- Recalcular el precio.

Si el modelo no puede construir el payload completo de `GetPrice()`, el frontend mantiene un flujo alterno local que intenta resolver categoria, variables, productos y municipio con los catalogos actuales.

## Flujo funcional principal

1. El usuario entra en `/menu/search-natural`.
2. La pantalla carga catalogos base:
   - Subcategorias desde `localStorage.listSubcategoria`.
   - Condiciones de pago desde `CondicionesPagoService.GetAllCondicionPago`.
3. El usuario escribe la consulta natural.
4. Angular extrae un borrador local de cantidad, medidas, municipio, condicion, unidad y texto de producto.
5. Angular llama a `naturalpricequery/query`.
6. La API interpreta la frase y devuelve un payload de precio o datos suficientes para resolverlo.
7. Angular normaliza la respuesta y arma un `GetPriceQueryFilter`.
8. Angular llama a `calculoprecio/GetPrice`.
9. Angular muestra:
   - Min US$
   - Max US$
   - Total
   - ID de calculo

## API NaturalPriceQuery

### Endpoint

```text
POST https://mooreapps.com.ve/AppServiceBackVertical/api/naturalpricequery/query
```

### Responsabilidad tecnica

La API debe recibir una consulta natural y devolver datos normalizados que permitan construir el request de `GetPrice()`.

El contrato recomendado es devolver el payload dentro de `data.getPricePayload`.

### Request recomendado

```json
{
  "query": "Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND",
  "text": "Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND",
  "texto": "Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND",
  "textoNatural": "Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND",
  "cantidad": 5000,
  "cantidadSolicitada": 5000,
  "largo": 5,
  "ancho": 7,
  "medidaBasica": 5,
  "medidaOpuesta": 7,
  "municipio": "Caracas",
  "condicionPago": 40,
  "unidad": "UND",
  "producto": "etiquetas digitales adhesivas mate full color",
  "subCategoriaId": 0
}
```

### Campos de entrada

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `query` | string | Si | Texto natural escrito por el usuario. |
| `text` | string | No | Alias compatible del texto natural. |
| `texto` | string | No | Alias compatible del texto natural. |
| `textoNatural` | string | No | Alias compatible del texto natural. |
| `cantidad` | number | No | Cantidad detectada por Angular. |
| `cantidadSolicitada` | number | No | Alias de cantidad. |
| `largo` | number | No | Medida basica detectada. |
| `ancho` | number | No | Medida opuesta detectada. |
| `medidaBasica` | number | No | Alias de largo. |
| `medidaOpuesta` | number | No | Alias de ancho. |
| `municipio` | string | No | Municipio detectado en el texto. |
| `condicionPago` | number | No | Codigo de condicion de pago, si ya esta disponible. |
| `unidad` | string | No | Unidad detectada en el texto. |
| `producto` | string | No | Texto depurado de producto. |
| `subCategoriaId` | number | No | Categoria seleccionada o detectada previamente. |

## Respuesta recomendada

```json
{
  "data": {
    "getPricePayload": {
      "idMunicipio": 123,
      "appProuctId": 456,
      "cantidad": 5000,
      "largo": 5,
      "ancho": 7,
      "unidadId": 1,
      "unidad": 1,
      "condicionDePago": 40
    },
    "producto": {
      "id": 456,
      "code": "ETIQ-001",
      "description1": "Etiqueta digital adhesiva",
      "description2": "Mate full color",
      "conversiones": []
    },
    "municipio": {
      "recnum": 123,
      "descMunicipio": "Caracas"
    }
  }
}
```

### Campos minimos para calcular precio

Para que Angular llame automaticamente a `GetPrice()`, la respuesta debe permitir resolver:

| Campo GetPrice | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `idMunicipio` | number | Si | Identificador del municipio. |
| `appProuctId` | number | Si | Identificador del producto. Mantiene el nombre usado por `GetPrice()`. |
| `cantidad` | number | Si | Cantidad solicitada. |
| `largo` | number | Condicional | Medida basica. Aplica en productos que requieren medidas. |
| `ancho` | number | Condicional | Medida opuesta. Aplica en productos que requieren medidas. |
| `unidadId` | number | Recomendado | Identificador de unidad. |
| `unidad` | number | Recomendado | Alias de unidad usado por `GetPrice()`. |
| `condicionDePago` | number | Recomendado | Codigo de condicion de pago. |

### Nombres alternos aceptados por Angular

Para facilitar compatibilidad mientras se estabiliza el contrato, Angular puede leer el payload de precio desde cualquiera de estas propiedades:

- `getPricePayload`
- `getPriceQueryFilter`
- `priceQueryFilter`
- `parametrosGetPrice`
- `parametrosPrecio`
- La raiz de `data`

Tambien acepta alias internos:

| Valor esperado | Alias aceptados |
| --- | --- |
| `appProuctId` | `appProductId`, `productId`, `productoId`, `appProduct.id`, `producto.id` |
| `idMunicipio` | `municipioId`, `municipio.recnum`, `municipality.recnum` |
| `cantidad` | `cantidadSolicitada`, `quantity` |
| `condicionDePago` | `condicionPago`, `condicionPagoCodigo`, `paymentConditionCode` |
| `unidadId` | `unidad`, `appUnitsId`, `unitId` |
| `largo` | `medidaBasica`, `length` |
| `ancho` | `medidaOpuesta`, `width` |

## API GetPrice

### Endpoint

```text
POST https://mooreapps.com.ve/AppServiceBackVertical/api/calculoprecio/GetPrice
```

### Request enviado por Angular

```json
{
  "idMunicipio": 123,
  "appProuctId": 456,
  "cantidad": 5000,
  "largo": 5,
  "ancho": 7,
  "unidadId": 1,
  "unidad": 1,
  "condicionDePago": 40
}
```

### Respuesta esperada de GetPrice

```json
{
  "data": {
    "precio": 10.5,
    "precioMasFlete": 11.2,
    "precioMaximo": 12,
    "precioMaximoMasFlete": 12.8,
    "flete": 0.7,
    "calculoId": 987,
    "cantidadConvertida": 5000
  }
}
```

Angular usa estos campos para actualizar la tarjeta de resultado:

- `precio`
- `precioMasFlete`
- `precioMaximo`
- `precioMaximoMasFlete`
- `flete`
- `calculoId`
- `cantidadConvertida`

## Frontend Angular

### Ruta

```text
/menu/search-natural
```

### Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| `src/app/pages/productos/search-natural/search-natural.page.ts` | Orquesta interpretacion natural, normalizacion del payload, consulta de precio y estado de pantalla. |
| `src/app/pages/productos/search-natural/search-natural.page.html` | Pantalla Ionic con texto natural, parametros resueltos, candidatos, caracteristicas y resultado. |
| `src/app/pages/productos/search-natural/search-natural.module.ts` | Modulo lazy-loaded de la pantalla. |
| `src/app/pages/productos/search-natural/search-natural-routing.module.ts` | Ruta local de la pantalla. |
| `src/app/services/producto.service.ts` | Cliente HTTP para `NaturalPriceQuery()` y `getPrice()`. |

### Servicio HTTP

En `ProductoService` existen dos metodos clave:

```ts
NaturalPriceQuery(data): Observable<any>
```

Llama a:

```text
basePathVertical + naturalpricequery/query
```

```ts
getPrice(data): Observable<any>
```

Llama a:

```text
basePathVertical + calculoprecio/GetPrice
```

### Flujo tecnico en Angular

1. `interpretarTexto()` limpia el estado anterior.
2. `extraerDraft()` obtiene un borrador local de la frase.
3. `buildNaturalPriceQueryPayload()` arma el request hacia `NaturalPriceQuery`.
4. `ProductoService.NaturalPriceQuery()` envia la consulta al backend.
5. `aplicarNaturalPriceQueryResponse()` procesa la respuesta.
6. `aplicarDraftDesdeApi()` actualiza cantidad y medidas si la API las devuelve.
7. `aplicarCatalogosDesdeApi()` actualiza categoria, condicion, municipio y variables si vienen en la respuesta.
8. `getGetPricePayloadFromNaturalResponse()` normaliza el payload para `GetPrice()`.
9. `consultarPrecioConPayload()` llama a `ProductoService.getPrice()`.
10. `aplicarResultadoPrecio()` actualiza precio, flete, maximo, total y calculoId.

### Fallback local

Si `NaturalPriceQuery` falla o no devuelve datos suficientes para resolver precio, Angular ejecuta `interpretarTextoLocal()`.

Ese flujo local intenta:

- Resolver condicion de pago por texto.
- Resolver subcategoria por similitud.
- Resolver municipio con `ClienteService.ListMunicipios`.
- Cargar variables con `GetAllAppVariableSearchAgrupado`.
- Buscar productos por caracteristicas con `GetAllProductusByCriteria`.
- Buscar productos generales con `GetAllVertical`.

Este fallback permite que la pantalla siga siendo usable aunque el modelo no responda.

## Reglas funcionales relevantes

### Producto unico o candidatos

Si la API devuelve un producto unico, Angular lo muestra como seleccionado. Si devuelve varios candidatos, el usuario debe seleccionar el correcto.

Cuando el producto viene desde `NaturalPriceQuery`, Angular no calcula usando la seleccion del producto. Espera el payload normalizado y llama a `GetPrice()` con los parametros del modelo.

### Municipio

El municipio puede venir como:

```json
{
  "municipio": {
    "recnum": 123,
    "descMunicipio": "Caracas"
  }
}
```

Tambien puede venir solo como `idMunicipio` dentro del payload de precio. Para mostrar nombre en pantalla se recomienda devolver el objeto `municipio`.

### Condicion de pago

La condicion puede venir como objeto:

```json
{
  "condicionPago": {
    "codigo": 40,
    "descripcion": "ANTICIPADO"
  }
}
```

O como codigo:

```json
{
  "condicionDePago": 40
}
```

### Unidad

Para calcular precio se recomienda enviar `unidadId` y `unidad` con el mismo identificador numerico esperado por `GetPrice()`.

## Validaciones del frontend antes de calcular

En el flujo con payload de modelo, Angular solo llama a `GetPrice()` si logra resolver:

- `appProuctId > 0`
- `idMunicipio > 0`
- `cantidad > 0`

Si esos campos no existen, no se llama automaticamente a `GetPrice()` y se mantiene el flujo local o la seleccion manual.

## Casos de prueba funcionales

### Caso 1: interpretacion completa

Entrada:

```text
Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND
```

Esperado:

- API devuelve `getPricePayload`.
- Angular llama a `GetPrice()`.
- Se muestra precio minimo, precio maximo y total.

### Caso 2: varios productos candidatos

Entrada:

```text
Cotizar 1000 etiquetas adhesivas para Caracas
```

Esperado:

- API devuelve `productosCandidatos`.
- Angular muestra lista de candidatos.
- Usuario selecciona producto.
- Usuario puede recalcular.

### Caso 3: municipio no resuelto

Entrada:

```text
Cotizar 1000 etiquetas adhesivas para una ciudad inexistente
```

Esperado:

- API no devuelve `idMunicipio`.
- Angular no llama automaticamente a `GetPrice()`.
- Usuario debe seleccionar municipio manualmente.

### Caso 4: API no disponible

Esperado:

- Angular usa fallback local.
- Se muestra mensaje si no puede resolver categoria o producto.
- La pantalla no debe quedar bloqueada en loading.

## Errores y mensajes

| Situacion | Comportamiento |
| --- | --- |
| `NaturalPriceQuery` falla | Angular usa fallback local. |
| Payload incompleto | Angular no llama a `GetPrice()` automaticamente. |
| `GetPrice()` falla | Se muestra `No fue posible calcular el precio`. |
| Sin categoria resuelta en fallback | Se muestra `No pude identificar la categoria...`. |
| Sin producto seleccionado | Se muestra `Seleccione un producto candidato` al recalcular. |

## Recomendaciones de contrato

Para reducir ambiguedad, se recomienda estabilizar la respuesta de `NaturalPriceQuery` asi:

```json
{
  "data": {
    "getPricePayload": {
      "idMunicipio": 123,
      "appProuctId": 456,
      "cantidad": 5000,
      "largo": 5,
      "ancho": 7,
      "unidadId": 1,
      "unidad": 1,
      "condicionDePago": 40
    },
    "producto": {},
    "municipio": {},
    "condicionPago": {},
    "subCategoria": {},
    "productosCandidatos": [],
    "variablesSeleccionadas": []
  }
}
```

El campo mas importante es `data.getPricePayload`. Si viene completo, Angular puede calcular el precio sin pasos adicionales del usuario.
