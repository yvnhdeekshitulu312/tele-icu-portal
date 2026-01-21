import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VteSurgicalRiskAssessmentComponent } from './vte-surgical-risk-assessment.component';

describe('VteSurgicalRiskAssessmentComponent', () => {
  let component: VteSurgicalRiskAssessmentComponent;
  let fixture: ComponentFixture<VteSurgicalRiskAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VteSurgicalRiskAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VteSurgicalRiskAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
