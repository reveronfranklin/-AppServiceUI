import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneralService } from './general.service';
import {
  ClienteBusquedaPorRifResponseDto,
  ConsultaPorRifRequestDto,
  ConsultaPorRifResponseDto,
} from '../models/consulta-por-rif-dto';

@Injectable({
  providedIn: 'root',
})
export class ConsultaPorRifService {
  private readonly basePathVertical: string;
  private readonly controller = 'consultaporrif/';
  private readonly accionPath = 'get-by-rif';
  private readonly searchClientesPath = 'search-clientes';

  constructor(
    private http: HttpClient,
    private gensvc: GeneralService,
  ) {
    this.basePathVertical = this.gensvc.basePathVertical;
  }

  getByRif(rif: string): Observable<ConsultaPorRifResponseDto> {
    const data: ConsultaPorRifRequestDto = {
      Rif: (rif || '').trim(),
    };

    return this.http
      .post<ConsultaPorRifResponseDto>(
        this.basePathVertical + this.controller + this.accionPath,
        JSON.stringify(data),
      )
      .pipe();
  }

  searchClientes(searchText: string): Observable<ClienteBusquedaPorRifResponseDto> {
    const data = {
      SearchText: (searchText || '').trim(),
    };

    return this.http
      .post<ClienteBusquedaPorRifResponseDto>(
        this.basePathVertical + this.controller + this.searchClientesPath,
        JSON.stringify(data),
      )
      .pipe();
  }
}
