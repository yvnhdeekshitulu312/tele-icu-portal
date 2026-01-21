import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAnesthesiaAssessmentComponent } from './pre-anesthesia-assessment.component';

describe('PreAnesthesiaAssessmentComponent', () => {
  let component: PreAnesthesiaAssessmentComponent;
  let fixture: ComponentFixture<PreAnesthesiaAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreAnesthesiaAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreAnesthesiaAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
