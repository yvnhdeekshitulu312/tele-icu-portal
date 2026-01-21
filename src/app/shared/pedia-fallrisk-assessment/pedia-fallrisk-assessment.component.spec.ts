import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PediaFallriskAssessmentComponent } from './pedia-fallrisk-assessment.component';

describe('PediaFallriskAssessmentComponent', () => {
  let component: PediaFallriskAssessmentComponent;
  let fixture: ComponentFixture<PediaFallriskAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PediaFallriskAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PediaFallriskAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
