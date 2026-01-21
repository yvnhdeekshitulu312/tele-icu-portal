import { TestBed } from '@angular/core/testing';

import { PatientadmissionService } from './patientadmission.service';

describe('PatientadmissionService', () => {
  let service: PatientadmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientadmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
