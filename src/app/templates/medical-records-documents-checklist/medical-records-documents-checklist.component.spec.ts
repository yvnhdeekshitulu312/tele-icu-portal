import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordsDocumentsChecklistComponent } from './medical-records-documents-checklist.component';

describe('MedicalRecordsDocumentsChecklistComponent', () => {
  let component: MedicalRecordsDocumentsChecklistComponent;
  let fixture: ComponentFixture<MedicalRecordsDocumentsChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalRecordsDocumentsChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsDocumentsChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
