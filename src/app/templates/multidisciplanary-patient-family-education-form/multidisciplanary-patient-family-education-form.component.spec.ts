import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultidisciplanaryPatientFamilyEducationFormComponent } from './multidisciplanary-patient-family-education-form.component';

describe('MultidisciplanaryPatientFamilyEducationFormComponent', () => {
  let component: MultidisciplanaryPatientFamilyEducationFormComponent;
  let fixture: ComponentFixture<MultidisciplanaryPatientFamilyEducationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultidisciplanaryPatientFamilyEducationFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultidisciplanaryPatientFamilyEducationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
