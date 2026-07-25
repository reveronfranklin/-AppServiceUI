import { Injectable } from '@angular/core';
import { PrecioDto } from '../interfaces/precio';

@Injectable({
  providedIn: 'root',
})
export class PrecioMasFleteStorageService {
  private readonly storageKey = 'precio-mas-flete';

  get(): PrecioDto | null {
    const value = localStorage.getItem(this.storageKey);

    if (!value || value === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  set(precio: PrecioDto): void {
    localStorage.setItem(this.storageKey, JSON.stringify(precio));
  }
}
