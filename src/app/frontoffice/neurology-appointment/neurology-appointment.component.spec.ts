import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeurologyAppointmentComponent } from './neurology-appointment.component';

describe('NeurologyAppointmentComponent', () => {
  let component: NeurologyAppointmentComponent;
  let fixture: ComponentFixture<NeurologyAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeurologyAppointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeurologyAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
