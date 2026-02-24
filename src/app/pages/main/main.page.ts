import { Component, OnInit } from '@angular/core';
import { MtrTipoMonedaDto } from '../../models/mtr-tipo-moneda-dto';
import { MtrBancosDto } from '../../models/mtr-bancos-dto';
import { MtrTipoMonedaQueryFilter } from '../../interfaces/mtr-tipo-moneda-query-filter';
import { CobTipoTransaccionDto } from '../../models/cob-tipo-transaccion-dto';
import { MtrBancosQueryFilter } from '../../interfaces/mtr-bancos-query-filter';
import { CobTipoTransaccionQueryFilter } from '../../interfaces/cob-tipo-transaccion-query-filter';
import { CobTipoTransaccionService } from '../../services/cob-tipo-transaccion.service';
import { MtrBancosService } from '../../services/mtr-bancos.service';
import { MtrTipoMonedaService } from '../../services/mtr-tipo-moneda.service';
import { CobTransaccionesService } from '../../services/cob-transacciones.service';
import { CobTransaccionesDto } from 'src/app/models/cob-transacciones-dto';
import { CobTransaccionesQueryFilter } from '../../interfaces/cob-transacciones-query-filter';
import { OfdTipoDocumentoDto } from '../../models/ofd-tipo-documento-dto';
import { OfdTipoDocumentoQueryFilter } from '../../interfaces/ofd-tipo-documento-query-filter';
import { OfdTipoDocumentoServiceService } from '../../services/ofd-tipo-documento-service.service';
import { MtrOficinaQueryFilter } from '../../interfaces/mtr-oficina-query-filter';
import { IUsuario } from '../../interfaces/iusuario';
import { MtrOficinaServiceService } from '../../services/mtr-oficina-service.service';
import { MtrOficinaDto } from '../../models/mtr-oficina-dto';
import { GeneralService } from '../../services/general.service';
import { MtrVendedorDto } from '../../models/mtr-vendedor-dto';
import { MtrVendedorQueryFilter } from '../../interfaces/mtr-vendedor-query-filter';
import { MtrVendedorService } from '../../services/mtr-vendedor.service';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { PageMenuQueryFilter } from '../../interfaces/page-menu-query-filter';
import { GenericFilter } from '../../interfaces/generic-filter';
import { SapTratamientoContactoGetDto } from '../../models/sap-tratamiento-contacto-get-dto';
import { SapCargoContactoGetDto } from '../../models/sap-cargo-contacto-get-dto';
import { SapPoderContactoGetDto } from '../../models/sap-poder-contacto-get-dto';
import { SapDepartamentoContactoGetDto } from '../../models/sap-departamento-contacto-get-dto';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { CotizacionesListService } from '../../services/cotizaciones/cotizaciones-list.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  usuario: IUsuario;

  listMtrTipoMonedasDto: MtrTipoMonedaDto[] = [];
  listMtrBancosDto: MtrBancosDto[] = [];
  listCobTipoTransaccionDto: CobTipoTransaccionDto[] = [];
  listCobTransaccionesDto: CobTransaccionesDto[] = [];
  listCobTransaccionesImpuestoDto: CobTransaccionesDto[] = [];
  listOfdTipoDocumentoDto: OfdTipoDocumentoDto[] = [];
  mtrOficinaDto: MtrOficinaDto[] = [];

  mtrTipoMonedaQueryFilter: MtrTipoMonedaQueryFilter;
  mtrBancosQueryFilter: MtrBancosQueryFilter;
  cobTipoTransaccionQueryFilter: CobTipoTransaccionQueryFilter;
  cobTransaccionesQueryFilter: CobTransaccionesQueryFilter;
  ofdTipoDocumentoQueryFilter: OfdTipoDocumentoQueryFilter;

  mtrOficinaQueryFilter: MtrOficinaQueryFilter;

  mtrVendedoresDto: MtrVendedorDto[] = [];
  mtrVendedorQueryFilter: MtrVendedorQueryFilter;

  pageMenuQueryFilter: PageMenuQueryFilter;
  role: number;

  genericFilter: GenericFilter;
  listTratamientoDto: SapTratamientoContactoGetDto[] = [];
  listSapCargoContacto: SapCargoContactoGetDto[] = [];
  listsapPoderContactoGetDto: SapPoderContactoGetDto[] = [];
  listSapDepartamentoContacto: SapDepartamentoContactoGetDto[] = [];
  urlMoneda = '../../../assets/moneda.json';
  urlOficinas = '../../../assets/oficinas.json';
  constructor(
    private gs: GeneralService,
    private cobTipoTransaccionService: CobTipoTransaccionService,
    private mtrBancosService: MtrBancosService,
    private mtrTipoMonedaService: MtrTipoMonedaService,
    private cobTransaccionesService: CobTransaccionesService,
    private ofdTipoDocumentoServiceService: OfdTipoDocumentoServiceService,
    private mtrOficinaService: MtrOficinaServiceService,
    private mtrVendedorService: MtrVendedorService,
    public router: Router,
    public loginService: LoginService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private configuracionService: ConfiguracionService,
    private cotizacionesListService: CotizacionesListService,
  ) {
    this.usuario = this.gs.GetUsuario();
  }

  async ngOnInit() {
    console.log('this.usuario en  ngOnInit del main', this.usuario);

    if (!this.usuario.user) {
      this.router.navigate(['/login']);
    }
    await this.cargarCombos();
    //ParametrosMaquinas
    this.configuracionService.getParametrosMaquina().subscribe((resp) => {
      localStorage.setItem('parametrosMaquinas', JSON.stringify(resp));
    });
  }
  async ionViewDidEnter() {
    console.log('ionViewDidEnter inicia cargar combo');
    await this.cargarCombos();
    console.log('ionViewDidEnter fin cargar combo');
  }

  async cargarCombos() {
    console.log('Inicio cargar combos', Date.now());

    //Busco subcategorias
    const data = {
      Id: 0,
      Description: '',
    };
    this.productoService.SubCategoryGetAll(data).subscribe((result) => {
      localStorage.setItem('listSubcategoria', JSON.stringify(result.data));
    });

    //Oficinas

    fetch(this.urlOficinas)
      .then((res) => res.json())
      .then((json) => {
        this.mtrOficinaDto = json;
        localStorage.setItem(
          'listOficinas',
          JSON.stringify(this.mtrOficinaDto),
        );
      });

    //Vendedores

    this.mtrVendedorQueryFilter = {
      usuario: this.usuario.user,
      oficina: 0,
    };
    this.mtrVendedorService
      .ListVendedoresPorUsuario(this.mtrVendedorQueryFilter)
      .subscribe((resp) => {
        this.mtrVendedoresDto = resp.data;
        console.log(
          'Lista de Vendedores en cargarCombos',
          this.mtrVendedoresDto,
        );
        localStorage.setItem(
          'listVendedores',
          JSON.stringify(this.mtrVendedoresDto),
        );
      });

    //Moneda

    this.mtrTipoMonedaQueryFilter = {
      id: 0,
      descripcion: '',
    };
    fetch(this.urlMoneda)
      .then((res) => res.json())
      .then((json) => {
        this.listMtrTipoMonedasDto = json;
        localStorage.setItem(
          'listMoneda',
          JSON.stringify(this.listMtrTipoMonedasDto),
        );
      });

    /*this.MtrTipoMonedaService.ListMonedas(this.mtrTipoMonedaQueryFilter).subscribe(respMoneda => {
      this.listMtrTipoMonedasDto = respMoneda.data;
      console.log('Moneda', respMoneda.data);
      localStorage.setItem('listMoneda', JSON.stringify(this.listMtrTipoMonedasDto));
    });*/

    //Tipo de Transaccion

    this.cobTipoTransaccionQueryFilter = {
      searchText: '',
    };

    this.cobTipoTransaccionService
      .ListCobTipoTransaccion(this.cobTipoTransaccionQueryFilter)
      .subscribe((respTipo) => {
        this.listCobTipoTransaccionDto = respTipo.data;
        localStorage.setItem('listCobTipoTransaccion', '');
        localStorage.setItem(
          'listCobTipoTransaccion',
          JSON.stringify(this.listCobTipoTransaccionDto),
        );
      });

    //Banco

    this.mtrBancosQueryFilter = {
      codigo: '',
      nombre: '',
      idTipoTransaccion: '',
    };

    this.mtrBancosService
      .ListBancos(this.mtrBancosQueryFilter)
      .subscribe((resp) => {
        this.listMtrBancosDto = resp.data;
        localStorage.setItem('listMtrBanco', '');
        localStorage.setItem(
          'listMtrBanco',
          JSON.stringify(this.listMtrBancosDto),
        );
      });

    //Cob Transaccion

    this.cobTransaccionesQueryFilter = {
      efectivo: true,
      idTransacccionCobranzas: 0,
    };

    this.cobTransaccionesService
      .listCobTransaccionesEfectivo(this.cobTransaccionesQueryFilter)
      .subscribe((resp) => {
        this.listCobTransaccionesDto = resp.data;
        localStorage.setItem(
          'listCobTransacciones',
          JSON.stringify(this.listCobTransaccionesDto),
        );
      });

    //Cob Transacciones Impuesto

    this.cobTransaccionesQueryFilter = {
      efectivo: false,
      idTransacccionCobranzas: 0,
    };

    this.cobTransaccionesService
      .listCobTransaccionesRetenciones(this.cobTransaccionesQueryFilter)
      .subscribe((resp) => {
        this.listCobTransaccionesImpuestoDto = resp.data;
        localStorage.setItem(
          'listCobTransaccionesRetencion',
          JSON.stringify(this.listCobTransaccionesImpuestoDto),
        );
      });

    //Tipo Documento adjunto

    this.ofdTipoDocumentoQueryFilter = {
      idGrupoTipoDocumento: 2,
      nombreDocumento: '',
      idTipoDocumento: 0,
    };

    this.ofdTipoDocumentoServiceService
      .listTipoDocumento(this.ofdTipoDocumentoQueryFilter)
      .subscribe((resp) => {
        this.listOfdTipoDocumentoDto = resp.data;
        localStorage.setItem(
          'listTipoDocumento',
          JSON.stringify(this.listOfdTipoDocumentoDto),
        );
      });

    //MAestro de Contactos
    this.genericFilter = {
      pageNumber: 1,
      pageSize: 20,
    };

    this.clienteService
      .GetAllSapTratamientoContacto(this.genericFilter)
      .subscribe(
        (respTratamiento) => {
          this.listTratamientoDto = respTratamiento;
          localStorage.setItem(
            'listTratamientoDto',
            JSON.stringify(this.listTratamientoDto),
          );
        },
        (error) => {
          console.log('en el error list tratamiento: ', error);
        },
      );

    this.clienteService
      .ListGetAllSapCargoContacto(this.genericFilter)
      .subscribe(
        (respCargoContacto) => {
          this.listSapCargoContacto = respCargoContacto;
          localStorage.setItem(
            'listSapCargoContacto',
            JSON.stringify(this.listSapCargoContacto),
          );
        },
        (error) => {
          console.log('en el error list cargo: ', error);
        },
      );

    this.clienteService
      .GetAllSapDepartamentoContacto(this.genericFilter)
      .subscribe(
        (respDepartamentoContacto) => {
          this.listSapDepartamentoContacto = respDepartamentoContacto;
          localStorage.setItem(
            'listSapDepartamentoContacto',
            JSON.stringify(this.listSapDepartamentoContacto),
          );
        },
        (error) => {
          console.log('en el error list departamento: ', error);
        },
      );

    this.clienteService
      .ListGetAllSapPoderContacto(this.genericFilter)
      .subscribe(
        (respPoderContacto) => {
          this.listsapPoderContactoGetDto = respPoderContacto;
          localStorage.setItem(
            'listsapPoderContactoGetDto',
            JSON.stringify(this.listsapPoderContactoGetDto),
          );
        },
        (error) => {
          console.log('en el error list departamento: ', error);
        },
      );

    console.log('Fin Cargar combos', Date.now());
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  onClickExit() {
    localStorage.clear();
    this.cotizacionesListService.filterSearchText = '';
    this.gs.KillUsuario();
    this.router.navigate(['/login']);
  }
}
