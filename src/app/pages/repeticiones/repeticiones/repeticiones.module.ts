import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepeticionesPageRoutingModule } from './repeticiones-routing.module';

import { RepeticionesPage } from './repeticiones.page';

//import { AnimationEvent } from '@angular/animations';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    //AnimationEvent,

    RepeticionesPageRoutingModule,
    

  ],
  declarations: [RepeticionesPage]
})
export class RepeticionesPageModule {}
