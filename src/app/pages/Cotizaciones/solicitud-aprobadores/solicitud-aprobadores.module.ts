import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitudAprobadoresPageRoutingModule } from './solicitud-aprobadores-routing.module';
import { SolicitudAprobadoresPage } from './solicitud-aprobadores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SolicitudAprobadoresPageRoutingModule,
  ],
  declarations: [SolicitudAprobadoresPage],
})
export class SolicitudAprobadoresPageModule {}
