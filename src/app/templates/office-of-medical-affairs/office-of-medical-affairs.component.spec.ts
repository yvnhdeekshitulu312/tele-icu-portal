import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeOfMedicalAffairsComponent } from './office-of-medical-affairs.component';

describe('OfficeOfMedicalAffairsComponent', () => {
  let component: OfficeOfMedicalAffairsComponent;
  let fixture: ComponentFixture<OfficeOfMedicalAffairsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfficeOfMedicalAffairsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeOfMedicalAffairsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
