import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBannerComponent } from './patient-banner.component';

describe('PatientBannerComponent', () => {
  let component: PatientBannerComponent;
  let fixture: ComponentFixture<PatientBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
