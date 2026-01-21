import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoundAssessmentComponent } from './wound-assessment.component';

describe('WoundAssessmentComponent', () => {
  let component: WoundAssessmentComponent;
  let fixture: ComponentFixture<WoundAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WoundAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WoundAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
