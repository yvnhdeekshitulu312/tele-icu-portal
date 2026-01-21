import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQuickActionsComponent } from './patient-quick-actions.component';

describe('PatientQuickActionsComponent', () => {
  let component: PatientQuickActionsComponent;
  let fixture: ComponentFixture<PatientQuickActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientQuickActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientQuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
