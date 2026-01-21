import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalInformedConsentLaserTreatmentComponent } from './medical-informed-consent-laser-treatment.component';

describe('MedicalInformedConsentLaserTreatmentComponent', () => {
  let component: MedicalInformedConsentLaserTreatmentComponent;
  let fixture: ComponentFixture<MedicalInformedConsentLaserTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalInformedConsentLaserTreatmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalInformedConsentLaserTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
