import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgicalSafetyChecklistComponent } from './surgical-safety-checklist.component';

describe('SurgicalSafetyChecklistComponent', () => {
  let component: SurgicalSafetyChecklistComponent;
  let fixture: ComponentFixture<SurgicalSafetyChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgicalSafetyChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgicalSafetyChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
