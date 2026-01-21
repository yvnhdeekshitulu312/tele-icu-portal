import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionreconciliationComponent } from './admissionreconciliation.component';

describe('AdmissionreconciliationComponent', () => {
  let component: AdmissionreconciliationComponent;
  let fixture: ComponentFixture<AdmissionreconciliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmissionreconciliationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionreconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
