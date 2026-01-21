import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionDischargeDocumentChecklistComponent } from './admission-discharge-document-checklist.component';

describe('AdmissionDischargeDocumentChecklistComponent', () => {
  let component: AdmissionDischargeDocumentChecklistComponent;
  let fixture: ComponentFixture<AdmissionDischargeDocumentChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmissionDischargeDocumentChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionDischargeDocumentChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
