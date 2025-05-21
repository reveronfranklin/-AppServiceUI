/* eslint-disable arrow-body-style */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { AppGeneralQuotesGetDto } from 'src/app/models/app-general-quotes-get-dto';
import { AppVariablesEspecificacionesGeneralGetDto, AppVariablesEspecificacionesPartesGetDto, EspecificacionesGetDto, EspecificacionesUpdateDto, PapelesTipoGramaje, PartesFilter, PartesGetDto, TintasGetDto, TintasValidasGetDto, TipoOrden } from 'src/app/models/especificaciones';
import { CotizacionesListService } from 'src/app/services/cotizaciones/cotizaciones-list.service';
import { AppDetailQuotesGetDto } from 'src/app/models/app-detail-quotes-get-dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';


@Component({
  selector: 'app-especificaciones',
  templateUrl: './especificaciones.page.html',
  styleUrls: ['./especificaciones.page.scss'],
})
export class EspecificacionesPage implements OnInit {
  public cotizacion: AppGeneralQuotesGetDto
  public partesFilter: PartesFilter;
  public especificacionesGetDto: EspecificacionesGetDto;
  public partesOriginalGetDto: PartesGetDto[] = [];
  public partesGetDto: PartesGetDto[] = [];
  public tintasOriginalGetDto: TintasValidasGetDto[] = [];
  public tintasGetDto: TintasValidasGetDto[] = [];
  public tintasRespaldoGetDto: TintasValidasGetDto[] = [];
  public appVariablesEspecificacionesPartesGetDto: AppVariablesEspecificacionesPartesGetDto[] = [];
  public appVariablesEspecificacionesGeneralGetDto: AppVariablesEspecificacionesGeneralGetDto[] = []
  public contadorTintas: string[] = [];


  public _guardando: boolean = false;
  public partesGetDtoSelected: PartesGetDto;
  public papelesValidosOriginal: PapelesTipoGramaje[] = [];
  public papelesValidos: PapelesTipoGramaje[] = [];
  public ListTipoOrden: TipoOrden[] = [];

  form: FormGroup;
  public idPapel: string = '';
  public cantTintas: number = 0;
  public showLoading: boolean = false;
  public titulo: string = '';
  public mensaje: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cotizacionesService: CotizacionesListService,
    private actionSheetCtrl: ActionSheetController,
    public generalService: GeneralService,) {

    this.buildForm();

  }

  ngOnInit() {
    this.cargarTipoOrden();
    this.cotizacion = this.router.getCurrentNavigation().extras.state.cotizacion;
    console.log('cotizacion recibida en especificaciones', this.cotizacion);
    this.partesFilter = {
      cotizacion: this.cotizacion.cotizacion,
      renglon: 1,
      propuesta: 1,
      idAppDetailQuote: this.cotizacion.appDetailQuotesGetDto[0].id,
      idProducto: this.cotizacion.appDetailQuotesGetDto[0].idProducto
      //this.searchText
    };
    console.log('filter enviado en especificaciones' , this.partesFilter );

    this.showLoading = true;
    this.mensaje = 'Cargando...';

    this.cotizacionesService.GetEspecificacionesCotizacion(this.partesFilter)
      .subscribe(result => {
        this.showLoading = false;
        this.mensaje = '';

        //this.especificacionesGetDto=result.data.especificacionesGetDto;
        this.appVariablesEspecificacionesGeneralGetDto = result.data.appVariablesEspecificacionesGeneralGetDto;
        this.partesGetDto = result.data.listPartesGetDto;
        this.partesOriginalGetDto = result.data.listPartesGetDto;
        this.tintasGetDto = result.data.listTintasValidasGetDto;
        this.tintasOriginalGetDto = result.data.listTintasValidasGetDto;
        this.tintasRespaldoGetDto = result.data.listTintasValidasGetDto;
        this.cantTintas = this.cotizacion.appDetailQuotesGetDto[0].cantidadTintas;
        this.form.get('idTipoOrden').setValue(result.data.idTipoOrden);


        //event.target.complete();
      });
  }

  ionViewDidEnter() {


    this.cotizacionesService.cotizacion$.subscribe(dat => {
      this.cotizacion = dat;

    });

  }

  cargarTipoOrden() {

    this.ListTipoOrden = [
      { idTipoOrden: 1, tipoorden: '1 - EXACTA' },
      { idTipoOrden: 2, tipoorden: '2 - CAMBIO ESPECIF.' },
      { idTipoOrden: 3, tipoorden: '3 - NUEVA' },
      { idTipoOrden: 4, tipoorden: '4 - CAMBIO DISEÑO' },
      { idTipoOrden: 5, tipoorden: '5 - AMBOS CAMBIOS' },
    ];
  }

  buildForm() {

    this.form = this.formBuilder.group({

      cotizacion: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(13)]],
      renglon: [1, [Validators.required, Validators.min(1)]],
      propuesta: [1, [Validators.required, Validators.min(1)]],
      idParte: [0, [Validators.required, Validators.min(1)]],
      idPapel: ['', [Validators.required]],
      frasesMarginales: [''],
      tintasFrente: ['', [Validators.required]],
      tintasRespaldo: ['', []],
      idTipoOrden: [0, [Validators.required]],

    });
  }

  gotoBack() {
    const itemProd = this.cotizacion.appDetailQuotesGetDto[0];
    this.router.navigate(['edit-detalle-cotizacion'], { state: { cotizacion: this.cotizacion, item: itemProd, operacion: 1 } })

  }

  cuentaTintas(actual, nuevo) {
    let tintaFrente: string = actual;
    const listaTintas: string[] = [];
    if (tintaFrente.trim() === '') {
      tintaFrente = nuevo;
    } else {
      tintaFrente = tintaFrente + ';' + nuevo;

    }
    const tintasFrenteInputArray = tintaFrente.split(';');
    tintasFrenteInputArray.map((item) => {

      const existe = listaTintas.includes(item);
      if (!existe && item.length > 0) {
        listaTintas.push(item);
      }
    });
    return listaTintas.length;

  }

  validarTintasPorParte(origen: string) {

    const listaTintas: string[] = [];
    if (this.form.get('tintasFrente').value.length <= 0) {



      this.generalService.presentToast('Cantidad de tintas invalida', 'danger');
      return false;
    }

    if (origen === 'tintasFrente') {
      const tintasFrenteInputArray = this.form.get('tintasFrente').value.split(';');
      tintasFrenteInputArray.map((item) => {
        if (item !== 'S/IMP') {
          const existe = listaTintas.includes(item);
          if (!existe && item.length > 0) {listaTintas.push(item);}
        }

      });

      if (listaTintas.length > this.cantTintas) {
        return false;
      }
      return true;
    }

    if (this.form.get('tintasRespaldo').value.length > 0 && origen === 'tintasRespaldo') {
      const tintasRespaldoInputArray = this.form.get('tintasRespaldo').value.split(';');
      tintasRespaldoInputArray.map((item) => {

        const existe = listaTintas.includes(item);
        if (!existe && item.length > 0) {listaTintas.push(item);}
      });
      if (listaTintas.length > this.cantTintas) {


        return false;
      }
      return true;
    }




  }

  validarTintasAfecta(origen: string) {
    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte === this.form.get('idParte').value;
    });
    foundElementValores['frasesMarginales'] = this.form.get('frasesMarginales').value;

    const valido = this.validarTintasPorParte(origen);

    if (!valido) {return;}

    if (origen === 'tintasFrente') {
      foundElementValores['tintasFrenteNew'] = this.form.get('tintasFrente').value;
    }
    if (origen === 'tintasRespaldo') {
      foundElementValores['tintasRespaldoNew'] = this.form.get('tintasRespaldo').value;
    }


  }

  actualizaTintaArreglo(origen: string) {
    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte === this.form.get('idParte').value
    });
    if (origen === 'tintasFrente') {
      foundElementValores['tintasFrenteNew'] = this.form.get('tintasFrente').value;
    }
    if (origen === 'tintasRespaldo') {
      foundElementValores['tintasRespaldoNew'] = this.form.get('tintasRespaldo').value;
    }

  }



    validarListaTintas() {

    const listaTintas: string[] = [];
    const partes = [...this.partesGetDto];

    let i = 0;
    for (i = 0; i < this.partesGetDto.length; i++) {

      if (this.partesGetDto[i].tintasFrenteNew === '') {
        this.partesGetDto[i].tintasFrenteNew = this.partesGetDto[i].tintasFrente;
      }
      if (this.partesGetDto[i].tintasRespaldoNew === '') {
        this.partesGetDto[i].tintasRespaldoNew = this.partesGetDto[i].tintasRespaldo;
      }

      const tintasFrenteArray = this.partesGetDto[i].tintasFrenteNew.split(';');
      tintasFrenteArray.map((item) => {
        if (item !== 'S/IMP') {
          const existe = listaTintas.includes(item);
          if (!existe && item.length > 0) {listaTintas.push(item);}
        }

      });
      const tintasRespaldoArray = this.partesGetDto[i].tintasRespaldoNew.split(';');
      tintasRespaldoArray.map((item) => {
        if (item !== 'S/IMP') {
          const existe = listaTintas.includes(item);
          if (!existe && item.length > 0) {listaTintas.push(item);}
        }

      });

      if (this.partesGetDto[i].idPapelNew === '') {
        this.partesGetDto[i].idPapelNew = this.partesGetDto[i].idPapel;
      }

    }

    if (listaTintas.length > this.cantTintas) {

      return false;
    }
    return true;
  }

  radioChangeHandler(event, id, idVariable, itemvalores) {

    this.findAndUpdate(id, idVariable, 'valorReal', event.target.defaultValue);
  }

  radioGeneralChangeHandler(event, id, idVariable, itemvalores) {

    this.findGeneralAndUpdate(id, idVariable, 'valorReal', event.target.defaultValue, event.target.checked);

  }

  findAndUpdate(id, idVariable, prop, newValue) {

    //*********** busca el objeto de la  lavariable seleccionada */

    const foundElement = this.appVariablesEspecificacionesPartesGetDto.find((valores) => {
      return valores.idVariable === idVariable;
    });

    //*****************Buscamos elemento del valo de la variable seeccionada******************************* */
    const foundElementValores = foundElement.appValoresVariablesEspecificacionesPartesGetDto.find((valores) => {
      return valores.id === id;
    });
    /***************limpiamoss el valor real en todo el arreglo****************************** */
    foundElement.appValoresVariablesEspecificacionesPartesGetDto.map((dato) => {
      if (dato.flagMultipleValor === '') {
        dato.valorReal = '';
      }


    });

    /********Modificamos el valor real co el nuevo valor************* */
    foundElementValores[prop] = newValue;


  }

  findGeneralAndUpdate(id, idVariable, prop, newValue, cheked) {
    console.log('newValue', newValue);
    //*********** busca el objeto de la  lavariable seleccionada */

    const foundElement = this.appVariablesEspecificacionesGeneralGetDto.find((valores) => {
      return valores.idVariable === idVariable;
    });
    console.log('foundElement',foundElement);

    //*****************Buscamos elemento del valo de la variable seeccionada******************************* */
    const foundElementValores = foundElement.appValoresVariablesEspecificacionesGeneralGetDto.find((valores) => {
      return valores.id === id;
    });

    console.log('foundElementValores',foundElementValores);

    /***************limpiamos el valor real en todo el arreglo****************************** */

    foundElement.appValoresVariablesEspecificacionesGeneralGetDto.map((dato) => {

      /*if (dato.valorReal.length > 0) {
        dato.cheked = true;
      } */
      //dato.valorReal='';
      //dato.cheked = false;
      if (dato.flagMultipleValor === '') {
        dato.valorReal = '';
        dato.cheked = false;
      }

      /********Modificamos el valor real co el nuevo valor************* */


    });
    if (cheked === false) {
      newValue = '';
    }
    foundElementValores[prop] = newValue;
    foundElementValores['cheked'] = cheked;

  }


  searchFrente(event) {


    const val = event.detail.value;

    if (val && val.trim() !== '') {
      this.tintasGetDto = this.tintasOriginalGetDto.filter((tinta) => {
        return (tinta.codigo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.tintasGetDto = this.tintasOriginalGetDto;
    }

  }

  searchPapel(event) {


    const val = event.detail.value;

    if (val && val.trim() !== '') {
      this.papelesValidos = this.papelesValidosOriginal.filter((papel) => {
        return (papel.idPapel.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.papelesValidos = this.papelesValidosOriginal;
    }

  }

  limpiarTintasFrente() {
    this.form.get('tintasFrente').setValue('');
    this.tintasGetDto = this.tintasOriginalGetDto
    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte == this.form.get('idParte').value
    });
    foundElementValores['tintasFrenteNew'] = '';



  }
  limpiarTintasRespaldo() {
    this.form.get('tintasRespaldo').setValue('');
    this.tintasRespaldoGetDto = this.tintasOriginalGetDto
    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte == this.form.get('idParte').value
    });
    foundElementValores['tintasRespaldoNew'] = '';

  }
  limpiarPapel() {
    this.form.get('idPapel').setValue('');
    this.papelesValidos = this.papelesValidosOriginal;
    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte == this.form.get('idParte').value
    });
    foundElementValores['idPapelNew'] = '';

  }
  searchRespaldo(event) {


    const val = event.detail.value;

    if (val && val.trim() != '') {
      this.tintasRespaldoGetDto = this.tintasOriginalGetDto.filter((tinta) => {
        return (tinta.codigo.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.tintasRespaldoGetDto = this.tintasOriginalGetDto
    }

  }



  selectFrente(frente) {


    if (frente.codigo == 'S/IMP') {
      this.form.get('tintasFrente').setValue(frente.codigo);
      this.validarTintasAfecta('tintasFrente');
      return;
    }
    var contieneNuevaTinta = this.form.get('tintasFrente').value.includes(frente.codigo);
    if (contieneNuevaTinta) {
      return;
    }
    const cantidad = this.cuentaTintas(this.form.get('tintasFrente').value, frente.codigo)
    if (cantidad > this.cantTintas) {
      return;
    }


    let tintaFrente: string = this.form.get('tintasFrente').value;
    if (tintaFrente.trim() == '') {
      this.form.get('tintasFrente').setValue(frente.codigo);
    } else {
      tintaFrente = tintaFrente + ';' + frente.codigo
      this.form.get('tintasFrente').setValue(tintaFrente);
    }
    this.validarTintasAfecta('tintasFrente');

  }

  selectRespaldo(respaldo) {
    if (respaldo.codigo == 'S/IMP') {
      this.form.get('tintasRespaldo').setValue(respaldo.codigo);
      return;
    }
    var contieneNuevaTinta = this.form.get('tintasRespaldo').value.includes(respaldo.codigo);
    if (contieneNuevaTinta) {
      return;
    }
    const cantidad = this.cuentaTintas(this.form.get('tintasRespaldo').value, respaldo.codigo)
    if (cantidad > this.cantTintas) {
      return;
    }

    let tinta: string = this.form.get('tintasRespaldo').value;
    if (tinta.trim() === '') {
      this.form.get('tintasRespaldo').setValue(respaldo.codigo);
    } else {
      tinta = tinta + ';' + respaldo.codigo
      this.form.get('tintasRespaldo').setValue(tinta);
    }
    this.validarTintasAfecta('tintasRespaldo');

  }

  update() {

    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte === this.form.get('idParte').value;
    });

    foundElementValores['frasesMarginales'] = this.form.get('frasesMarginales').value;

    const listaTintasValida = this.validarListaTintas();
    if (listaTintasValida === true) {

      const especificacionesUpdateDto: EspecificacionesUpdateDto = new EspecificacionesUpdateDto();


      especificacionesUpdateDto.idTipoOrden = this.form.get('idTipoOrden').value;
      especificacionesUpdateDto.appVariablesEspecificacionesGeneralGetDto = this.appVariablesEspecificacionesGeneralGetDto;
      especificacionesUpdateDto.partesGetDto = this.partesGetDto;
      especificacionesUpdateDto.partesFilter = this.partesFilter;
      console.log('**********especificacionesUpdateDto*****>>>>>>>', especificacionesUpdateDto);
      this.showLoading = true;
      this.mensaje = 'Guardando...';
      this.cotizacionesService.updateEspecificacionesCotizacion(especificacionesUpdateDto)
        .subscribe(result => {
          console.log('result en la respuesta de update especificaciones', result);

          this.showLoading = false;
          this.mensaje = '';

          if (result.meta != null && result.meta.isValid === false) {
            this.generalService.presentToast(result.meta.message, 'danger');

            return;
          }
          this.appVariablesEspecificacionesGeneralGetDto = result.data.appVariablesEspecificacionesGeneralGetDto;
          this.partesGetDto = result.data.listPartesGetDto;
          this.partesOriginalGetDto = result.data.listPartesGetDto;
          this.tintasGetDto = result.data.listTintasValidasGetDto;
          this.tintasOriginalGetDto = result.data.listTintasValidasGetDto;
          this.tintasRespaldoGetDto = result.data.listTintasValidasGetDto;
          this.cantTintas = this.cotizacion.appDetailQuotesGetDto[0].cantidadTintas;

          const foundElement = this.partesGetDto.find((item) => {
            return item.idParte === this.form.get('idParte').value;
          });
          this.setItem(foundElement);

          //event.target.complete();
        });



    } else {
      //alert('Cantidad de tintas invalida');
      this.generalService.presentToast('Cantidad de tintas invalida', 'danger');
      return;
    }

  }

  selecPapel(papel) {

    this.form.get('idPapel').setValue(papel.idPapel);

    const foundElementValores = this.partesGetDto.find((valores) => {
      return valores.idParte == this.form.get('idParte').value
    });

    foundElementValores['idPapelNew'] = papel.idPapel
    foundElementValores['frasesMarginales'] = this.form.get('frasesMarginales').value

  }

  buscarTintasFrente() {

  }
  buscarTintasRespaldo() {

  }
  refresh() {
    this.partesFilter = {
      cotizacion: this.cotizacion.cotizacion,
      renglon: 1,
      propuesta: 1,
      idAppDetailQuote: this.cotizacion.appDetailQuotesGetDto[0].id,
      idProducto: this.cotizacion.appDetailQuotesGetDto[0].idProducto
      //this.searchText
    };


    this.showLoading = true;
    this.mensaje = 'Cargando...';

    this.cotizacionesService.GetEspecificacionesCotizacion(this.partesFilter)
      .subscribe(result => {
        this.showLoading = false;
        this.mensaje = '';

        this.appVariablesEspecificacionesGeneralGetDto = result.data.appVariablesEspecificacionesGeneralGetDto;
        this.partesGetDto = result.data.listPartesGetDto;
        this.partesOriginalGetDto = result.data.listPartesGetDto;
        this.tintasGetDto = result.data.listTintasValidasGetDto;
        this.tintasOriginalGetDto = result.data.listTintasValidasGetDto;
        this.tintasRespaldoGetDto = result.data.listTintasValidasGetDto;
        this.cantTintas = this.cotizacion.appDetailQuotesGetDto[0].cantidadTintas;

      });


  }

  setItem(item) {


    this.partesGetDtoSelected = item;
    this.titulo = 'Parte: ' + this.partesGetDtoSelected.idParte + ' Medida:' + this.partesGetDtoSelected.medidaBasica + ' X ' + this.partesGetDtoSelected.medidaOpuesta;
    if (this.cantTintas != null && this.cantTintas >= 0) {
      this.titulo = this.titulo + ' ' + this.cantTintas + ' Tintas'
    }
    this.appVariablesEspecificacionesPartesGetDto = this.partesGetDtoSelected.appVariablesEspecificacionesPartesGetDto;

    this.papelesValidos = this.partesGetDtoSelected.papelesValidos;
    this.papelesValidosOriginal = this.partesGetDtoSelected.papelesValidos

    this.form.get('cotizacion').setValue(this.partesGetDtoSelected.cotizacion);
    this.form.get('renglon').setValue(this.partesGetDtoSelected.renglon);
    this.form.get('propuesta').setValue(this.partesGetDtoSelected.propuesta);
    this.form.get('idParte').setValue(this.partesGetDtoSelected.idParte);
    this.form.get('idPapel').setValue(this.partesGetDtoSelected.idPapel);
    this.form.get('frasesMarginales').setValue(this.partesGetDtoSelected.frasesMarginales);
    if (this.partesGetDtoSelected.tintasFrenteNew != null && this.partesGetDtoSelected.tintasFrenteNew.length > 0) {
      this.form.get('tintasFrente').setValue(this.partesGetDtoSelected.tintasFrenteNew);
    } else {
      this.form.get('tintasFrente').setValue(this.partesGetDtoSelected.tintasFrente);
    }
    if (this.partesGetDtoSelected.tintasRespaldoNew != null && this.partesGetDtoSelected.tintasRespaldoNew.length > 0) {
      this.form.get('tintasRespaldo').setValue(this.partesGetDtoSelected.tintasRespaldoNew);
    } else {
      this.form.get('tintasRespaldo').setValue(this.partesGetDtoSelected.tintasRespaldo);
    }
    this.selectItem(this.partesGetDtoSelected.idParte);
    //this.validarTintasAfecta('tintasFrente');

  }

  selectItem(parte: number) {

    const listaTintas: string[] = [];
    let partes = [...this.partesGetDto]

    let i = 0;
    for (i = 0; i < this.partesGetDto.length; i++) {

      if (this.partesGetDto[i].idParte == parte) {
        this.partesGetDto[i].selected = true;
      } else {
        this.partesGetDto[i].selected = false;
      }

    }

  }

  save(event) { }
  Update() { }
}
