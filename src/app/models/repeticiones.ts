import { AppProductConversionGetDto } from "./app-product-conversion-get-dto";
import { AppProductsGetDto } from "./app-products-get-dto";

export class ListaRepeticiones {

    appOrdenProductoRepeticionGetDto:AppOrdenProductoRepeticionGetDto[] = [];
    appRepeticionClienteProducto:AppRepeticionClienteProducto[] = [];
    appRepeticionClienteNombreForma:AppRepeticionClienteNombreForma[] = [];
    appRepeticionClienteBasica:AppRepeticionClienteBasica[] = [];
    appRepeticionClienteOpuesta:AppRepeticionClienteOpuesta[] = [];
    appRepeticionClientePartes:AppRepeticionClientePartes[] = [];
    appRepeticionClienteTintas:AppRepeticionClienteTintas[] = [];
    appRepeticionClientePapelPrimeraParte:AppRepeticionClientePapelPrimeraParte[]=[];
    appRepeticionClientePapelSegundaParte:AppRepeticionClientePapelSegundaParte[]=[];
    appRepeticionClientePapelTerceraParte:AppRepeticionClientePapelTerceraParte[]=[];
    appRepeticionClientePapelCuartaParte:AppRepeticionClientePapelCuartaParte[]=[];
    appRepeticionClientePapelQuintaParte:AppRepeticionClientePapelQuintaParte[]=[];

}

export class AppOrdenProductoRepeticionGetDto {

    id: number;
    idCliente: string;
    nombreCliente: string;
    orden: string;
    fecha: Date;
    appproductsId: number;
    appproductsDecription: string;
    codProducto: string;
    nombreProducto: string;
    nombreForma: string;
    medidaBase: number;
    medidaVariable: number;
    partesFormula: number;
    cantTintas: number;
    papelPrimeraParte: string;
    papelSegundaParte: string;
    papelTerceraParte: string;
    papelCuartaParte: string;
    papelQuintaParte: string;
    medidaBaseDecimal: number;
    medidaVariableDecimal: number;
    basicaHumano: string;
    opuestaHumano: string;
    cantidadOrdenada: number;
    millares: number;
    precioUnitarioUsd: number;
    totalPropuestaUsd: number;
    medidaBasicaCm: number;
    medidaOpuestaCm: number;
    appProductConversionGetDto: AppProductConversionGetDto;
    appProductsGetDto: AppProductsGetDto;
    forma: string;
    salida: string;
    presentacion: string;

}
export class AppRepeticionClienteProducto
{

    id:number;
    idCliente :string;
    nombreProducto :string;


}
export class AppRepeticionClienteNombreForma
{

    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;

}
export class AppRepeticionClienteBasica
{

    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;


}
export class AppRepeticionClienteOpuesta
{
    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
}
export class AppRepeticionClientePartes
{
    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
}
export class AppRepeticionClienteTintas
{
    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
    cant_Tintas :number;

}
export class AppRepeticionClientePapelPrimeraParte
{
    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
    cant_Tintas :number;
    papelprimeraparte:string;
}
export class AppRepeticionClientePapelSegundaParte
{

    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
    cant_Tintas :number;
    papelprimeraparte :string;
    papelsegundaparte :string;
}
export class AppRepeticionClientePapelTerceraParte
{
    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
    cant_Tintas :number;
    papelprimeraparte :string;
    papelsegundaparte :string;
    papelterceraparte :string;
}
export class AppRepeticionClientePapelCuartaParte
{
    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
    cant_Tintas :number;
    papelprimeraparte :string;
    papelsegundaparte :string;
    papelterceraparte :string;
    papelcuartaparte :string;

}

export class AppRepeticionClientePapelQuintaParte
{

    id:number;
    idCliente :string;
    nombreProducto :string;
    nombreForma :string;
    basicaHumano :string;
    opuestaHumano :string;
    partes_formula :number;
    cant_Tintas :number;
    papelprimeraparte :string;
    papelsegundaparte :string;
    papelterceraparte :string;
    papelcuartaparte :string;
    papelquintaparte :string;




}
