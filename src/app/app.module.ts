import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentModule } from './components/component.module';
import { MomentModule } from 'ngx-moment';
import { HttpInterceptorService } from './interceptors/http-interceptor.service';
import { ClienteListPageModule } from './pages/clientes/cliente-list/cliente-list.module';
import { FotosWebShowPageModule } from './pages/adjuntos/fotos-web-show/fotos-web-show.module';
import { FotosShowPageModule } from './pages/adjuntos/fotos-show/fotos-show.module';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ComponentModule,
    MomentModule,
    FormsModule,
    ClienteListPageModule,
    FotosWebShowPageModule,
    FotosShowPageModule,
    FontAwesomeModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, fab, far);
  }

}
