import { TestBed } from '@angular/core/testing';

import { AkuWorklistService } from './aku-worklist.service';

describe('AkuWorklistService', () => {
  let service: AkuWorklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AkuWorklistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
