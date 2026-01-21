import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallsRiskAssessmentAndPreventionFormEndoscopyComponent } from './falls-risk-assessment-and-prevention-form-endoscopy.component';

describe('FallsRiskAssessmentAndPreventionFormEndoscopyComponent', () => {
  let component: FallsRiskAssessmentAndPreventionFormEndoscopyComponent;
  let fixture: ComponentFixture<FallsRiskAssessmentAndPreventionFormEndoscopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FallsRiskAssessmentAndPreventionFormEndoscopyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FallsRiskAssessmentAndPreventionFormEndoscopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
