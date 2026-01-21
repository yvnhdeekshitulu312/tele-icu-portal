import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupReassessmentComponent } from './followup-reassessment.component';

describe('FollowupReassessmentComponent', () => {
  let component: FollowupReassessmentComponent;
  let fixture: ComponentFixture<FollowupReassessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FollowupReassessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowupReassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
