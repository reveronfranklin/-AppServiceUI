import { Component, OnInit } from '@angular/core';
import { CobAdjuntosCobranzaService } from '../../../services/cob-adjuntos-cobranza.service';
import { GeneralService } from '../../../services/general.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AdjuntosCobranzaFilter } from '../../../interfaces/adjuntos-cobranza-filter';
import { CobGeneralCobranzaDto } from 'src/app/models/cob-general-cobranza-dto';
import { ModalController, Platform, LoadingController } from '@ionic/angular';
import { AppGeneralQuotesGetDto } from 'src/app/models/app-general-quotes-get-dto';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  filter: AdjuntosCobranzaFilter;
  itemcobGeneralCobranzaDto: CobGeneralCobranzaDto;
  cotizacion: AppGeneralQuotesGetDto;
  //recibe el numero de doc enviado
  documentoId: any;

  adjuntos = [];

  constructor(
    private cobac: CobAdjuntosCobranzaService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    // private platform: Platform,
    private modalCtrl: ModalController,
    private lc: LoadingController,
    private gensvc: GeneralService
  ) {}

  ngOnInit() {
    this.activateRoute.queryParams.subscribe((params) => {
      //Lee objeto enviado desde Listado de Cobranzas
      if (this.router.getCurrentNavigation().extras.state) {
        console.log(
          'objeto recibido en list de adjuntos',
          this.router.getCurrentNavigation().extras.state.cotizacion
        );
        this.cotizacion =
          this.router.getCurrentNavigation().extras.state.cotizacion;
        /*this.itemcobGeneralCobranzaDto =
          this.router.getCurrentNavigation().extras.state.user;

        this.showHeader();

        console.log('El objeto recibido es:');
        console.log(this.itemcobGeneralCobranzaDto);
        console.log(this.itemcobGeneralCobranzaDto.documento);
        console.log('@@@@@@@');

        //numero de documento
        this.documentoId = this.itemcobGeneralCobranzaDto.documento;
*/
        this.refresh();
      }
    });
  }

  //Es llamado desde ngOnInit y desde la UI
  refresh() {
    this.refreshList();
  }

  refreshList() {
    const filter = {
      cotizacion: this.cotizacion.cotizacion,
      renglon: 1,
      pageSize: 100,
      pageNumber: 1,
    };

    const loading = this.lc.create({
      message: 'Por favor, espere...',
    });

    loading.then((o) => {
      o.present();
    });

 

    this.cobac.GetAdjuntosByCotizacion(filter).subscribe((response) => {
      this.lc.dismiss();

      if (!response.meta.isValid) {
        alert(response.meta.message);
      }

      this.adjuntos = response.data;
      console.log('list adjuntos cotizacion', this.adjuntos);
    }),
      (error) => {
        //todo trabajar esta promise
        this.lc.dismiss();
        alert(JSON.stringify(error));
      };
  }

  showHeader() {}

  //regresa al Listado General de Cobranzas
  onGotoGrabacionCobranza() {
    let navigationExtras: NavigationExtras = {
      state: {
        user: this.itemcobGeneralCobranzaDto,
      },
    };

    this.router.navigate(['menu/grabacion-cobranza-list/' + this.documentoId]);
  }
}
