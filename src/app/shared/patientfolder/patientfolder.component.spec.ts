import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientfolderComponent } from './patientfolder.component';

describe('PatientfolderComponent', () => {
  let component: PatientfolderComponent;
  let fixture: ComponentFixture<PatientfolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientfolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientfolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
