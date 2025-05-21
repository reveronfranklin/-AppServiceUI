import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AprobacionCreatePage } from './aprobacion-create.page';

describe('AprobacionCreatePage', () => {
  let component: AprobacionCreatePage;
  let fixture: ComponentFixture<AprobacionCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprobacionCreatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AprobacionCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
