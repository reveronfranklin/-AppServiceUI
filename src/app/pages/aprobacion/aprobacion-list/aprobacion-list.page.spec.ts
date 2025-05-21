import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AprobacionListPage } from './aprobacion-list.page';

describe('AprobacionListPage', () => {
  let component: AprobacionListPage;
  let fixture: ComponentFixture<AprobacionListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprobacionListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AprobacionListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
