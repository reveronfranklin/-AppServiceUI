export class AppStatusQuoteGetDto {
  id: number;
  descripcion: string;

  flagModificar: string;

  editable: boolean;

  flagEnEspera: boolean;

  puedeGanarPerder: boolean;

  enGrabacion: boolean;
  claseCss: string;
}

export class EstatusDto {
  id: number;
  descripcion: string;
}
