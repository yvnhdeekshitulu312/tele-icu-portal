import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientfoldermlComponent } from './patientfolderml.component';

describe('PatientfoldermlComponent', () => {
  let component: PatientfoldermlComponent;
  let fixture: ComponentFixture<PatientfoldermlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientfoldermlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientfoldermlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
