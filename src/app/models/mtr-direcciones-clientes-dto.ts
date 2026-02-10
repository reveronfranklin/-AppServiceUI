import { MtrDireccionesDto } from './mtr-direcciones-dto';
import { MtrSectorDto } from './mtr-sector-dto';

export class MtrClienteDireccionDto {
  id: number;
  codigo: string;
  rifCliente: string;
  rifDireccion: string;
  nombreCliente: string;
  status: string;
  direccion: string;
  direccion1: string;
  direccion2: string;
  estado: string;
  municipio: string;
  descripcionMunicipio: string;
  descripcionEstado: string;
  idDireccionCliente: number;
  nombreEstado: string;
  nombreMunicipio: string;
  sector: string;
  ramo: string;
  descripcionSector: string;
  descripcionRamo: string;
  claseCss: string;
  idTipoNegocio: number;
  descripcionTipoNegocio: string;
  editable: boolean;
  nombreOficina: string;
  sectorObj: MtrSectorDto;
  puntoReferencia: string;

  nombreVendedor: string;
  direccionObj: MtrDireccionesDto;
  direccionClienteObj: MtrDireccionesDto;
}
