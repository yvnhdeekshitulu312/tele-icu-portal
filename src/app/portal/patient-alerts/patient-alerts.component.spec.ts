import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAlertsComponent } from './patient-alerts.component';

describe('PatientAlertsComponent', () => {
  let component: PatientAlertsComponent;
  let fixture: ComponentFixture<PatientAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAlertsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
