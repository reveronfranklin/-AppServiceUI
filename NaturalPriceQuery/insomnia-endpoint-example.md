# Prueba de NaturalPriceQuery en Insomnia

Este endpoint interpreta una consulta en lenguaje natural y debe devolver los parametros necesarios para llamar a `GetPrice()`.

## Request

**Metodo:** `POST`

**URL:**

```text
https://mooreapps.com.ve/AppServiceBackVertical/api/naturalpricequery/query
```

**Headers:**

```http
Content-Type: application/json
```

**Body JSON:**

```json
{
  "query": "Cotizar 5000 etiquetas digitales adhesivas mate full color de 5x7 cm para Caracas, pago anticipado, en UND",
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

## Respuesta esperada

El frontend puede leer cualquiera de estas propiedades para obtener los parametros de `GetPrice()`:

- `getPricePayload`
- `getPriceQueryFilter`
- `priceQueryFilter`
- `parametrosGetPrice`
- `parametrosPrecio`

Ejemplo recomendado:

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
    }
  }
}
```

## Payload final hacia GetPrice

Con la respuesta anterior, Angular llama a:

```text
POST https://mooreapps.com.ve/AppServiceBackVertical/api/calculoprecio/GetPrice
```

Con este body:

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
