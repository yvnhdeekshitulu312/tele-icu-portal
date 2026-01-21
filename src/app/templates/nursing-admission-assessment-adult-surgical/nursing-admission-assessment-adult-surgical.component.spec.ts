import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingAdmissionAssessmentAdultSurgicalComponent } from './nursing-admission-assessment-adult-surgical.component';

describe('NursingAdmissionAssessmentAdultSurgicalComponent', () => {
  let component: NursingAdmissionAssessmentAdultSurgicalComponent;
  let fixture: ComponentFixture<NursingAdmissionAssessmentAdultSurgicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingAdmissionAssessmentAdultSurgicalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingAdmissionAssessmentAdultSurgicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
