import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitudAprobacionPreciosPageRoutingModule } from './solicitud-aprobacion-precios-routing.module';
import { SolicitudAprobacionPreciosPage } from './solicitud-aprobacion-precios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitudAprobacionPreciosPageRoutingModule,
  ],
  declarations: [SolicitudAprobacionPreciosPage],
})
export class SolicitudAprobacionPreciosPageModule {}
