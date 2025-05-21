import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EspecificacionesPage } from './especificaciones.page';

describe('EspecificacionesPage', () => {
  let component: EspecificacionesPage;
  let fixture: ComponentFixture<EspecificacionesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EspecificacionesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EspecificacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
