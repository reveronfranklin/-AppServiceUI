import { Component, OnInit } from '@angular/core';
import { CobAdjuntosCobranzaService } from '../../../services/cob-adjuntos-cobranza.service';
import { GeneralService } from '../../../services/general.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AdjuntosCobranzaFilter } from '../../../interfaces/adjuntos-cobranza-filter';
import { CobGeneralCobranzaDto } from 'src/app/models/cob-general-cobranza-dto';
import { ModalController, Platform, LoadingController, AlertController } from '@ionic/angular';

//movil
import { FotosPage } from '../fotos/fotos.page';
import { FotosShowPage } from '../fotos-show/fotos-show.page';

//web
import { FotosWebPage } from '../fotos-web/fotos-web.page';
import { FotosWebShowPage } from '../fotos-web-show/fotos-web-show.page';

@Component({
    selector: 'app-list',
    templateUrl: './list.page.html',
    styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

    filter: AdjuntosCobranzaFilter;
    itemcobGeneralCobranzaDto: CobGeneralCobranzaDto;

    //recibe el numero de doc enviado
    documentoId: any

    adjuntos = []
    deleting = false;

    constructor(
        private cobac: CobAdjuntosCobranzaService,
        private activateRoute: ActivatedRoute,
        private router: Router,
        // private platform: Platform,
        private modalCtrl: ModalController,
        private lc: LoadingController,
        private alertController: AlertController,
        private gensvc: GeneralService) { }

    ngOnInit() {

        this.activateRoute.queryParams.subscribe(params => {

            //Lee objeto enviado desde Listado de Cobranzas
            if (this.router.getCurrentNavigation().extras.state) {

                this.itemcobGeneralCobranzaDto = this.router.getCurrentNavigation().extras.state.user;

                this.showHeader();

                console.log("El objeto recibido es:")
                console.log(this.itemcobGeneralCobranzaDto)
                console.log(this.itemcobGeneralCobranzaDto.documento)
                console.log("@@@@@@@")

                //numero de documento
                this.documentoId = this.itemcobGeneralCobranzaDto.documento

                this.refresh();

            }

        });

    }

    //Es llamado desde ngOnInit y desde la UI
    refresh() {
        this.refreshList(this.documentoId);
    }

    refreshList(numDoc: any) {

        this.filter = {
            documento: +numDoc,
            pageSize: 100,
            pageNumber: 1,
        };

        const loading = this.lc.create({
            message: 'Por favor, espere...'
        });

        loading.then(o => {
            o.present();
        });

        console.log('objeto enviado en GetAdjuntosByDcumento', this.filter)

        this.cobac.GetAdjuntosByDcumento(this.filter).subscribe(response => {

            this.lc.dismiss();

            if (!response.meta.isValid) {
                alert(response.meta.message)
            }

            console.log(response)

            this.adjuntos = response.data

        }), (error => {

            //todo trabajar esta promise
            this.lc.dismiss();
            alert(JSON.stringify(error))
        });

    }

    isGrabacion(): boolean {
        const item = this.itemcobGeneralCobranzaDto;
        if (!item) return false;

        if (String(item.status || '').trim().toUpperCase() === 'GRABACION') {
            return true;
        }

        const isTrue = (value: any) =>
            value === true || value === 1 || String(value ?? '').trim().toLowerCase() === 'true';

        return !isTrue(item.flagEnviado) &&
            !isTrue(item.flagConfirmado) &&
            !isTrue(item.flagAprobado) &&
            !isTrue(item.flagAnulado) &&
            !isTrue(item.flagReversado);
    }

    canDelete(adjunto: any): boolean {
        const nombreArchivo = String(adjunto?.nombreArchivo ?? adjunto?.NombreArchivo ?? '');
        return this.isGrabacion() && !/^RC_\d+_Consultado\.pdf$/i.test(nombreArchivo);
    }

    async confirmarEliminar(adjunto: any) {
        const alert = await this.alertController.create({
            header: 'Eliminar adjunto',
            message: `¿Desea eliminar ${adjunto.nombreArchivo}?`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => this.eliminarAdjunto(adjunto),
                },
            ],
        });
        await alert.present();
    }

    eliminarAdjunto(adjunto: any) {
        if (this.deleting) return;
        this.deleting = true;
        this.cobac.DeleteAdjuntoCobranza({
            documento: Number(this.documentoId),
            idAdjunto: Number(adjunto.indice ?? adjunto.Indice),
            usuarioConectado: this.gensvc.GetUsuario()?.user || '',
        }).subscribe({
            next: (response) => {
                this.deleting = false;
                if (response?.meta?.isValid === false || response?.isValid === false) {
                    this.gensvc.presentToast(response?.meta?.message || response?.message || 'No se pudo eliminar el adjunto', 'danger');
                    this.refresh();
                    return;
                }
                this.gensvc.presentToast('Adjunto eliminado correctamente', 'success');
                this.refresh();
            },
            error: () => {
                this.deleting = false;
                this.gensvc.presentToast('Error al conectar con el servidor', 'danger');
            },
        });
    }

    showHeader() {

    }

    async adjuntosAdd() {

        if (this.documentoId > 0) {



            //Cargar Adjuntos Browser

            const modal = await this.modalCtrl.create({
                component: FotosWebPage,
                componentProps: { numeroDocumento: this.documentoId }
            });

            modal.onDidDismiss().then(data => {

                //num doc recibido del modal
                let numDoc = data.data.documento

                //refresco la lista
                this.refreshList(numDoc);

            });

            return await modal.present();
        }



        else {
            alert("Número de documento invalido.")
            return
        }

    }
    /*   async adjuntosAddCopia() {
  
          if (this.documentoId > 0) {
              
              if (this.platform.is('cordova')) {
  
                  //cargar Adjuntos Movil
  
                  const modal = await this.modalCtrl.create({
                      component: FotosPage,
                      componentProps: { numeroDocumento: this.documentoId }
                  });
  
                  modal.onDidDismiss().then(data => {
                      
                      //num doc recibido del modal
                      let numDoc = data.data.documento
  
                      //refresco la lista
                      this.refreshList(numDoc);
                  
                  });
                  
                  return await modal.present();
  
              } else {
  
                  //Cargar Adjuntos Browser
  
                  const modal = await this.modalCtrl.create({
                      component: FotosWebPage,
                      componentProps: { numeroDocumento: this.documentoId }
                  });
  
                  modal.onDidDismiss().then(data => {
  
                      //num doc recibido del modal
                      let numDoc = data.data.documento
  
                      //refresco la lista
                      this.refreshList(numDoc);
  
                  });
  
                  return await modal.present();
  
              }
  
  
          }
          else {
              alert("Número de documento invalido.")
              return
          }
          
      } */
    //regresa al Listado General de Cobranzas
    onGotoGrabacionCobranza() {

        let navigationExtras: NavigationExtras = {
            state: {
                user: this.itemcobGeneralCobranzaDto
            }
        };

        this.router.navigate(['menu/grabacion-cobranza-list/' + this.documentoId]);

    }

    //mostrar un adjunto como modal
    async showAdjunto(link: any) {

        const modal = this.modalCtrl.create({
            component: FotosShowPage,
            componentProps: { link: link }
        });

        await modal.then(p => {
            p.present();
        })

    }

    //View Image Mobile or Browser
    async openPreview(img: any) {



        //UI para Cargar Adjuntos desde el Browser

        const modal = await this.modalCtrl.create({
            component: FotosWebShowPage,
            cssClass: 'fullscreen',
            componentProps: { link: img }
        });

        modal.onDidDismiss().then(data => {

            //num doc recibido del modal
            //let numDoc = data.data.documento

            //refresco la lista
            //this.refreshList(numDoc);

        });

        return await modal.present();


    }
    /*  async openPreviewCopia(img: any) {
 
         if (this.platform.is('cordova')) {
 
             //UI para Cargar Adjuntos desde el Movil
 
             const modal = await this.modalCtrl.create({
                 component: FotosShowPage,
                 componentProps: { link: img }
             });
 
             modal.onDidDismiss().then(data => {
 
                 //num doc recibido del modal
                 //let numDoc = data.data.documento
 
                 //refresco la lista
                 //this.refreshList(numDoc);
 
             });
 
             return await modal.present();
 
         } else {
 
             //UI para Cargar Adjuntos desde el Browser
 
             const modal = await this.modalCtrl.create({
                 component: FotosWebShowPage, 
                 cssClass: 'fullscreen',
                 componentProps: { link: img }
             });
 
             modal.onDidDismiss().then(data => {
 
                 //num doc recibido del modal
                 //let numDoc = data.data.documento
 
                 //refresco la lista
                 //this.refreshList(numDoc);
 
             });
 
             return await modal.present();
 
         }
     } */
}
