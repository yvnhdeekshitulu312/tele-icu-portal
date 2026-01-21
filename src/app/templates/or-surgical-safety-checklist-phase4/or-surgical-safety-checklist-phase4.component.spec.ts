import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrSurgicalSafetyChecklistPhase4Component } from './or-surgical-safety-checklist-phase4.component';

describe('OrSurgicalSafetyChecklistPhase4Component', () => {
  let component: OrSurgicalSafetyChecklistPhase4Component;
  let fixture: ComponentFixture<OrSurgicalSafetyChecklistPhase4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrSurgicalSafetyChecklistPhase4Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrSurgicalSafetyChecklistPhase4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
