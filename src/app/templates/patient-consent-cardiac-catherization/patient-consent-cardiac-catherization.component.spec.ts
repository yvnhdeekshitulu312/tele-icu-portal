import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsentCardiacCatherizationComponent } from './patient-consent-cardiac-catherization.component';

describe('PatientConsentCardiacCatherizationComponent', () => {
  let component: PatientConsentCardiacCatherizationComponent;
  let fixture: ComponentFixture<PatientConsentCardiacCatherizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientConsentCardiacCatherizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientConsentCardiacCatherizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
