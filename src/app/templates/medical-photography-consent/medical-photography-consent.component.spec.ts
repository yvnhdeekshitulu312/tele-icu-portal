import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalPhotographyConsentComponent } from './medical-photography-consent.component';

describe('MedicalPhotographyConsentComponent', () => {
  let component: MedicalPhotographyConsentComponent;
  let fixture: ComponentFixture<MedicalPhotographyConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalPhotographyConsentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalPhotographyConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
