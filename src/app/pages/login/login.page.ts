import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from '../../services/general.service';
import { ToastController } from '@ionic/angular';
//import { NetworkService } from '../../services/network.service';
import { PageMenuQueryFilter } from '../../interfaces/page-menu-query-filter';
import { CobTipoTransaccionService } from 'src/app/services/cob-tipo-transaccion.service';
import { MtrBancosService } from 'src/app/services/mtr-bancos.service';
import { MtrTipoMonedaService } from 'src/app/services/mtr-tipo-moneda.service';
import { CobTransaccionesService } from 'src/app/services/cob-transacciones.service';
import { OfdTipoDocumentoServiceService } from 'src/app/services/ofd-tipo-documento-service.service';
import { MtrOficinaServiceService } from 'src/app/services/mtr-oficina-service.service';
import { MtrVendedorService } from 'src/app/services/mtr-vendedor.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ConfiguracionService } from 'src/app/services/configuracion.service';
import { MtrTipoMonedaDto } from 'src/app/models/mtr-tipo-moneda-dto';
import { IUsuario } from 'src/app/interfaces/iusuario';
import { MtrBancosDto } from 'src/app/models/mtr-bancos-dto';
import { CobTipoTransaccionDto } from 'src/app/models/cob-tipo-transaccion-dto';
import { CobTransaccionesDto } from 'src/app/models/cob-transacciones-dto';
import { OfdTipoDocumentoDto } from 'src/app/models/ofd-tipo-documento-dto';
import { MtrOficinaDto } from 'src/app/models/mtr-oficina-dto';
import { MtrTipoMonedaQueryFilter } from 'src/app/interfaces/mtr-tipo-moneda-query-filter';
import { MtrBancosQueryFilter } from 'src/app/interfaces/mtr-bancos-query-filter';
import { CobTipoTransaccionQueryFilter } from 'src/app/interfaces/cob-tipo-transaccion-query-filter';
import { CobTransaccionesQueryFilter } from 'src/app/interfaces/cob-transacciones-query-filter';
import { OfdTipoDocumentoQueryFilter } from 'src/app/interfaces/ofd-tipo-documento-query-filter';
import { MtrOficinaQueryFilter } from 'src/app/interfaces/mtr-oficina-query-filter';
import { MtrVendedorDto } from 'src/app/models/mtr-vendedor-dto';
import { MtrVendedorQueryFilter } from 'src/app/interfaces/mtr-vendedor-query-filter';
import { GenericFilter } from 'src/app/interfaces/generic-filter';
import { SapTratamientoContactoGetDto } from 'src/app/models/sap-tratamiento-contacto-get-dto';
import { SapCargoContactoGetDto } from 'src/app/models/sap-cargo-contacto-get-dto';
import { SapPoderContactoGetDto } from 'src/app/models/sap-poder-contacto-get-dto';
import { SapDepartamentoContactoGetDto } from 'src/app/models/sap-departamento-contacto-get-dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  show: boolean;
  usuario = {
    User: '',
    Password: '',
  };
  isConnected = false;


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
  urlMoneda= '../../../assets/moneda.json';
  urlOficinas= '../../../assets/oficinas.json';



  //todo para corregir detalle en password

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';



  constructor(public loginService: LoginService,
    public activateRoute: ActivatedRoute,
    public router: Router,
    public gs: GeneralService,
    public toastController: ToastController,
    private productoService: ProductoService,
    private mtrVendedorService: MtrVendedorService,
    private cobTipoTransaccionService: CobTipoTransaccionService,
    private mtrBancosService: MtrBancosService,
    private cobTransaccionesService: CobTransaccionesService,
    private ofdTipoDocumentoServiceService: OfdTipoDocumentoServiceService,
   ) { }

  ngOnInit() {

    //TODO poner en blanco para produccion

    this.show = false;
    this.usuario.User = '';
    this.usuario.Password = '';

  }

  //para mostrar u ocultar el password
  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }


  async openToast(message, color) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color

    });
    toast.present();
  }
  onSubmitLogin() {

    console.log(this.usuario);
    this.show = true;


    this.loginService.login(this.usuario).subscribe(response => {
      console.log('response en login', response);

      if (response.validate) {

        localStorage.setItem('Validate', 'true');
        localStorage.setItem('Token', response.token);
        localStorage.setItem('User', response.user);
        localStorage.setItem('NombreUsuario', response.nombreUsuario);

        localStorage.setItem('Role', response.role);
        localStorage.setItem('menu', JSON.stringify(response.pageMenuDto));



        //Busco subcategorias
        const data =
        {
          Id: 0,
          Description: ''
        };
        this.productoService.SubCategoryGetAll(data).subscribe(result => {

          localStorage.setItem('listSubcategoria', JSON.stringify(result.data));
        });
        //Oficinas


        fetch(this.urlOficinas).then(res => res.json())
        .then(json => {
          this.mtrOficinaDto = json;
          localStorage.setItem('listOficinas', JSON.stringify(this.mtrOficinaDto));
        });

        //Vendedores

        this.mtrVendedorQueryFilter = {
          usuario: this.usuario.User,
          oficina: 0
        };
        this.mtrVendedorService.ListVendedoresPorUsuario(this.mtrVendedorQueryFilter).subscribe(resp => {
          this.mtrVendedoresDto = resp.data;

          localStorage.setItem('listVendedores', JSON.stringify(this.mtrVendedoresDto));
        });

         //Moneda

          this.mtrTipoMonedaQueryFilter = {
            id: 0,
            descripcion: ''
          };
          fetch(this.urlMoneda).then(res => res.json())
          .then(json => {
            this.listMtrTipoMonedasDto = json;
            localStorage.setItem('listMoneda', JSON.stringify(this.listMtrTipoMonedasDto));
          });

          //Tipo de Transaccion

          this.cobTipoTransaccionQueryFilter = {
            searchText: '',
          };

          this.cobTipoTransaccionService.ListCobTipoTransaccion(this.cobTipoTransaccionQueryFilter).subscribe(respTipo => {
            this.listCobTipoTransaccionDto = respTipo.data;
            localStorage.setItem('listCobTipoTransaccion', '');
            localStorage.setItem('listCobTipoTransaccion', JSON.stringify(this.listCobTipoTransaccionDto));
          });

          //Banco

          this.mtrBancosQueryFilter = {
            codigo: '',
            nombre: '',
            idTipoTransaccion: '',
          };

          this.mtrBancosService.ListBancos(this.mtrBancosQueryFilter).subscribe(resp => {
            this.listMtrBancosDto = resp.data;
            localStorage.setItem('listMtrBanco', '');
            localStorage.setItem('listMtrBanco', JSON.stringify(this.listMtrBancosDto));
          });


          //Cob Transaccion

          this.cobTransaccionesQueryFilter = {
            efectivo: true,
            idTransacccionCobranzas: 0
          };

          this.cobTransaccionesService.listCobTransaccionesEfectivo(this.cobTransaccionesQueryFilter).subscribe(resp => {
            this.listCobTransaccionesDto = resp.data;
            localStorage.setItem('listCobTransacciones', JSON.stringify(this.listCobTransaccionesDto));
          });
          //Cob Transacciones Impuesto

          this.cobTransaccionesQueryFilter = {
            efectivo: false,
            idTransacccionCobranzas: 0
          };

          this.cobTransaccionesService.listCobTransaccionesRetenciones(this.cobTransaccionesQueryFilter).subscribe(resp => {
            this.listCobTransaccionesImpuestoDto = resp.data;
            localStorage.setItem('listCobTransaccionesRetencion', JSON.stringify(this.listCobTransaccionesImpuestoDto));
          });


          //Tipo Documento adjunto


          this.ofdTipoDocumentoQueryFilter = {
            idGrupoTipoDocumento: 2,
            nombreDocumento: '',
            idTipoDocumento: 0,

          };

          this.ofdTipoDocumentoServiceService.listTipoDocumento(this.ofdTipoDocumentoQueryFilter).subscribe(resp => {
            this.listOfdTipoDocumentoDto = resp.data;
            localStorage.setItem('listTipoDocumento', JSON.stringify(this.listOfdTipoDocumentoDto));
          });


        this.router.navigateByUrl('/menu/main');
        this.show = false;
      } else {
        alert('Cuando la respuesta es No valida ' + response.validate);
        localStorage.setItem('Validate', 'false');
        this.gs.KillUsuario();
        this.openToast('Usuario o Clave Invalida', 'danger');
        this.show = false;

      }

    },
      error => {
        this.openToast(error, 'danger');
        this.show = false;
        console.log("en el error del login: ", error);
      });




  }



}
