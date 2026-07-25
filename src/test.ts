// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getTestBed, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

const defaultActivatedRoute = {
  snapshot: {
    params: {},
    queryParams: {},
    data: {},
  },
  params: of({}),
  queryParams: of({}),
  data: of({}),
};

const createDeepMock = (): any => {
  const target = () => undefined;
  return new Proxy(target, {
    get: (_target, property) => {
      if (property === Symbol.toPrimitive) {
        return () => 0;
      }
      if (property === 'toString') {
        return () => '';
      }
      if (property === 'valueOf') {
        return () => 0;
      }
      if (property === 'length') {
        return 0;
      }
      if (property === 'sort') {
        return () => [];
      }
      if (property === 'map') {
        return () => [];
      }
      if (property === 'filter') {
        return () => [];
      }
      if (property === 'find') {
        return () => undefined;
      }
      return createDeepMock();
    },
    apply: () => createDeepMock(),
  });
};

const defaultNavigationState = {
  item: createDeepMock(),
  cotizacion: createDeepMock(),
  cliente: createDeepMock(),
  contacto: createDeepMock(),
  precio: createDeepMock(),
  appProduct: createDeepMock(),
  itemProducto: {
    id: 0,
  },
  itemPrice: {
    id: 0,
    desde: 0,
    hasta: 0,
    precio: 0,
  },
  cobGeneralCobranzaDto: createDeepMock(),
  itemcobGrabacionCobranzaDto: createDeepMock(),
  itemRetencion: createDeepMock(),
  flag: 0,
  operacion: 0,
};

class TestRouterStub {
  url = '/';
  events = of({});

  getCurrentNavigation() {
    return {
      extras: {
        state: defaultNavigationState,
      },
    };
  }

  navigate() {
    return Promise.resolve(true);
  }

  navigateByUrl() {
    return Promise.resolve(true);
  }
}

localStorage.setItem('listSubcategoria', '[]');
localStorage.setItem('estadoCuenta', '{}');
localStorage.setItem('itemGeneralCobranza', JSON.stringify({ documento: '' }));
localStorage.setItem('itemGrabacionCobranza', JSON.stringify({
  transaccion: '',
  cotizacion: '',
  docAfectaSap: '',
  baseImponibleMostrar: '',
  ivaMostrar: '',
  montoOriginalMostrar: '',
}));
localStorage.setItem('listCobTransacciones', '[]');
localStorage.setItem('listTratamientoDto', '[]');
localStorage.setItem('listSapCargoContacto', '[]');
localStorage.setItem('listSapDepartamentoContacto', '[]');
localStorage.setItem('listsapPoderContactoGetDto', '[]');

const defaultItemCustomer = {
  id: 0,
  idDireccionCliente: 0,
  codigo: '',
  nombreCliente: '',
  rifCliente: '',
  rifDireccion: '',
  sector: '',
  descripcionSector: '',
  ramo: '',
  descripcionRamo: '',
  estado: '',
  municipio: '',
  descripcionMunicipio: '',
  descripcionEstado: '',
  direccion: '',
  direccion1: '',
  direccion2: '',
  idTipoNegocio: '',
  descripcionTipoNegocio: '',
  puntoReferencia: '',
  sectorObj: createDeepMock(),
};

const defaultItemAprobacion = {
  cotizacion: '',
  renglon: 0,
  idCliente: 0,
  razonSocial: '',
  producto: '',
  codigoProducto: '',
  vendedor: '',
  fechaString: '',
  oficina: '',
  nombreOficina: '',
  totalPropuestaUsd: 0,
  obsSolicitudPrecio: '',
  tasaExcepcion: 0,
  imprimirFacturaEnUSD: false,
  fechaPago: new Date(0).toISOString(),
  fiscal: '',
  observacionesCreditoExcepcion: '',
  solicitudCerrada: true,
  estatusPlanta: '',
};

const originalConfigureTestingModule = TestBed.configureTestingModule.bind(TestBed);
TestBed.configureTestingModule = ((moduleDef: any = {}) =>
  originalConfigureTestingModule({
    ...moduleDef,
    imports: [
      HttpClientTestingModule,
      FormsModule,
      ReactiveFormsModule,
      RouterTestingModule,
      ...(moduleDef.imports || []),
    ],
    providers: [
      { provide: ActivatedRoute, useValue: defaultActivatedRoute },
      { provide: Router, useClass: TestRouterStub },
      ...(moduleDef.providers || []),
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      ...(moduleDef.schemas || []),
    ],
  })) as any;

const originalCreateComponent = TestBed.createComponent.bind(TestBed);
TestBed.createComponent = ((component: any) => {
  const fixture = originalCreateComponent(component);
  const instance: any = fixture.componentInstance;

  if (instance) {
    instance.clienteRif = instance.clienteRif || {
      cliente: '',
      rif: '',
    };
    instance.detalleGrabacionCobranza =
      instance.detalleGrabacionCobranza || createDeepMock();
    instance.itemcobPagoRetencionesDto =
      instance.itemcobPagoRetencionesDto || createDeepMock();
    instance.cobGeneralCobranzaDto =
      instance.cobGeneralCobranzaDto || createDeepMock();
    instance.cotizacion = instance.cotizacion || createDeepMock();
    instance.item = instance.item || createDeepMock();
    instance.itemCustomer = instance.itemCustomer || defaultItemCustomer;
    instance.itemAprobacion = instance.itemAprobacion || defaultItemAprobacion;
    instance.itemContacto = instance.itemContacto || {
      idContacto: 0,
    };
    instance.itemcobGrabacionCobranzaDto =
      instance.itemcobGrabacionCobranzaDto || JSON.parse(localStorage.getItem('itemGrabacionCobranza'));
    instance.cobPagoRetencionesDto =
      instance.cobPagoRetencionesDto || [];
  }

  return fixture;
}) as any;

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
