import { MtrRamoDto } from './mtr-ramo-dto';

export interface MtrSectorDto {
  sector: string;
  descripcionSector: string;
  ramo: MtrRamoDto[];
}
