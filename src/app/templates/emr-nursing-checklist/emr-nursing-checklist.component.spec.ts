import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrNursingChecklistComponent } from './emr-nursing-checklist.component';

describe('EmrNursingChecklistComponent', () => {
  let component: EmrNursingChecklistComponent;
  let fixture: ComponentFixture<EmrNursingChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrNursingChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmrNursingChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
