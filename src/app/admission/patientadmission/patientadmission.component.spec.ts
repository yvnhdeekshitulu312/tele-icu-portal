import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientadmissionComponent } from './patientadmission.component';

describe('PatientadmissionComponent', () => {
  let component: PatientadmissionComponent;
  let fixture: ComponentFixture<PatientadmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientadmissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientadmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
