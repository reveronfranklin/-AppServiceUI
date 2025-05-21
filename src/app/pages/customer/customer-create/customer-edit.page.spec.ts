import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomerEditPage } from './customer-edit.page';

describe('CustomerEditPage', () => {
  let component: CustomerEditPage;
  let fixture: ComponentFixture<CustomerEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
