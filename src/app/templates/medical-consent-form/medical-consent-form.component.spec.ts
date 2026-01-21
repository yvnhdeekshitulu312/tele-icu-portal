import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalConsentFormComponent } from './medical-consent-form.component';

describe('MedicalConsentFormComponent', () => {
  let component: MedicalConsentFormComponent;
  let fixture: ComponentFixture<MedicalConsentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalConsentFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalConsentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
