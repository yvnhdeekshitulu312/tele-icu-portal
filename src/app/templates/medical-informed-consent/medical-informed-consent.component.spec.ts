import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalInformedConsentComponent } from './medical-informed-consent.component';

describe('MedicalInformedConsentComponent', () => {
  let component: MedicalInformedConsentComponent;
  let fixture: ComponentFixture<MedicalInformedConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalInformedConsentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalInformedConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
