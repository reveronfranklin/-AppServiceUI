import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';


import { AprobacionEditPage } from './aprobacion-edit.page';

describe('AprobacionEditPage', () => {
  let component: AprobacionEditPage;
  let fixture: ComponentFixture<AprobacionEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprobacionEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AprobacionEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
