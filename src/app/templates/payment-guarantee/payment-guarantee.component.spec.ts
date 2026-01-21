import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGuaranteeComponent } from './payment-guarantee.component';

describe('PaymentGuaranteeComponent', () => {
  let component: PaymentGuaranteeComponent;
  let fixture: ComponentFixture<PaymentGuaranteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentGuaranteeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentGuaranteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
