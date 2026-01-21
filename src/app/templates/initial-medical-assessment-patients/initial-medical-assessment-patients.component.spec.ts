import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialMedicalAssessmentPatientsComponent } from './initial-medical-assessment-patients.component';

describe('InitialMedicalAssessmentPatientsComponent', () => {
  let component: InitialMedicalAssessmentPatientsComponent;
  let fixture: ComponentFixture<InitialMedicalAssessmentPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialMedicalAssessmentPatientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialMedicalAssessmentPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
