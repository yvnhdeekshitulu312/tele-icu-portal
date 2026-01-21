import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCasesheetComponent } from './doctor-casesheet.component';

describe('DoctorCasesheetComponent', () => {
  let component: DoctorCasesheetComponent;
  let fixture: ComponentFixture<DoctorCasesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorCasesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCasesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
