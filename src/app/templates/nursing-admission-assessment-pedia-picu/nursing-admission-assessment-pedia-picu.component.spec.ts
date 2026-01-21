import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingAdmissionAssessmentPediaPicuComponent } from './nursing-admission-assessment-pedia-picu.component';

describe('NursingAdmissionAssessmentPediaPicuComponent', () => {
  let component: NursingAdmissionAssessmentPediaPicuComponent;
  let fixture: ComponentFixture<NursingAdmissionAssessmentPediaPicuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingAdmissionAssessmentPediaPicuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingAdmissionAssessmentPediaPicuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
