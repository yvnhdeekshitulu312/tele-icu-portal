import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallsVisualTriageFormComponent } from './falls-visual-triage-form.component';

describe('FallsVisualTriageFormComponent', () => {
  let component: FallsVisualTriageFormComponent;
  let fixture: ComponentFixture<FallsVisualTriageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FallsVisualTriageFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FallsVisualTriageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
