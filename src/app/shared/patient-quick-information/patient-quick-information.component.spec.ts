import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQuickInformationComponent } from './patient-quick-information.component';

describe('PatientQuickInformationComponent', () => {
  let component: PatientQuickInformationComponent;
  let fixture: ComponentFixture<PatientQuickInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientQuickInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientQuickInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
