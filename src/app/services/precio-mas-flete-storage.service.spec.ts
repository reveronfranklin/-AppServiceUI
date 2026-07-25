import { TestBed } from '@angular/core/testing';
import { PrecioMasFleteStorageService } from './precio-mas-flete-storage.service';
import { PrecioDto } from '../interfaces/precio';

describe('PrecioMasFleteStorageService', () => {
  let service: PrecioMasFleteStorageService;
  const storageKey = 'precio-mas-flete';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrecioMasFleteStorageService);
    localStorage.removeItem(storageKey);
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
  });

  it('debe guardar y recuperar el precio mas flete', () => {
    const precio: PrecioDto = {
      unitPriceBaseProduction: 100,
      precioMasFlete: 112,
      precioMaximo: 120,
      precioMaximoMasFlete: 134.4,
      calculoId: 10,
      flete: 12,
      fleteMaximo: 14.4,
      porcFlete: 12,
      precioPorRango: 100,
      desde: 1,
      hasta: 1000,
      porDebajoDeCantidadMinima: false,
      porcMaximoSobrePrecio: 20,
    };

    service.set(precio);

    expect(service.get()).toEqual(precio);
  });

  it('debe retornar null si no existe valor guardado', () => {
    expect(service.get()).toBeNull();
  });

  it('debe retornar null si el valor guardado no es JSON valido', () => {
    localStorage.setItem(storageKey, '{');

    expect(service.get()).toBeNull();
  });

  it('debe retornar null si el valor guardado es undefined textual', () => {
    localStorage.setItem(storageKey, 'undefined');

    expect(service.get()).toBeNull();
  });
});
