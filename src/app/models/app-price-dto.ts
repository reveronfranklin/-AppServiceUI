
export class AppPriceDto {

    desde: number;

    hasta: number;

    precio: number;

    precioMaximo: number;

    porcMaximoSobrePrecio: number;
}

export class AppPriceGetDto {

    id: number;
    appproductsId: number;
    desde: number;
    hasta: number;
    precio: number;
    precioMaximo: number;
    porcMaximoSobrePrecio: number;

}
export class AppPriceCreateDto {


    appproductsId: number;

    desde: number;

    hasta: number;

    precio: number;
}

export class AppPriceUpdateDto {

    id: number;

    appproductsId: number

    desde: number;

    hasta: number;

    precio: number;
}
export class AppPriceDeleteDto {

    id: number;


}

