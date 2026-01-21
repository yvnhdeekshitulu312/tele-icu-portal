import { TestBed } from '@angular/core/testing';

import { AdmissionrequestService } from './admissionrequest.service';

describe('AdmissionrequestService', () => {
  let service: AdmissionrequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmissionrequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
