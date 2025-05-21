import * as internal from "events";
export class EspecificacionesUpdateDto{
    idTipoOrden:number;
    partesFilter:PartesFilter;
    partesGetDto:PartesGetDto[] = [];
    appVariablesEspecificacionesGeneralGetDto:AppVariablesEspecificacionesGeneralGetDto[] = [];
  
}

export class EspecificacionesGetDto{
    idTipoOrden:number;
    appVariablesEspecificacionesGeneralGetDto:AppVariablesEspecificacionesGeneralGetDto[] = [];
    partesGetDto:PartesGetDto[] = [];
    tintasValidasGetDto:TintasValidasGetDto[] = [];
}
export class PartesGetDto{
    cotizacion:string;
    renglon:number;
    propuesta:number;
    idParte :number;
    idPapel :string;
    idPapelNew :string='';
    medidaBasica :string;
    medidaOpuesta :string;
    frasesMarginales :string;
    tipoPapel:string;
    gramaje:string;
    tintasFrente:string;
    tintasRespaldo:string;
    tintasFrenteNew:string='';
    tintasRespaldoNew:string='';
    selected:boolean=false;

    appVariablesEspecificacionesPartesGetDto:AppVariablesEspecificacionesPartesGetDto[] = [];
    papelesValidos:PapelesTipoGramaje[] = [];
    listTintasGetDto:TintasGetDto [] = [];
}

export class  TintasValidasGetDto{
    codigo:string;
}

export class  PapelesTipoGramaje{
    idPapel:string;
    tipoPapel:string;
    gramaje:string;
}

export class  TintasGetDto{
    cotizacion:string;
    renglon:number;
    propuesta:number;
    idParte :number;
    idUbicacion :number;
    idTinta:string;
}

export class PartesFilter {
    cotizacion:string;
    renglon:number;
    propuesta:number;
    idAppDetailQuote :number;
    idProducto :number;
}

export class PartesUpdatetDto{
    cotizacion:string;
    renglon:number;
    propuesta:number;
    idParte :number;
    idPapel :string;
    frasesMarginales :string;
    tintasFrente:string;
    tintasRespaldo:string;
   
}

export class  AppVariablesEspecificacionesPartesGetDto{
    id:number;
    codAplicacion:number;
    idVariable:number;
    nombreVariable:string;
    flagObligatorio:string;
    flagGralParte:string;
    orden :number;
    appValoresVariablesEspecificacionesPartesGetDto:AppValoresVariablesEspecificacionesPartesGetDto[] = [];
}
export class AppValoresVariablesEspecificacionesPartesGetDto{
    id:number;
    idVariable:number;
    valor:string;
    flagMultipleValor:string;
    valorReal:string;
    cheked :boolean;

}
export class  AppVariablesEspecificacionesGeneralGetDto{
    id:number;
    codAplicacion:number;
    idVariable:number;
    nombreVariable:string;
    flagObligatorio:string;
    flagGralParte:string;
    orden :number;
    appValoresVariablesEspecificacionesGeneralGetDto:AppValoresVariablesEspecificacionesGeneralGetDto[] = [];
}

export class AppValoresVariablesEspecificacionesGeneralGetDto{
    id:number;
    idVariable:number;
    valor:string;
    flagMultipleValor:string;
    valorReal:string;
    cheked :boolean;

}

export class TipoOrden{
    idTipoOrden:number;
    tipoorden:string;
   

}

