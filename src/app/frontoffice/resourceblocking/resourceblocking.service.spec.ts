import { TestBed } from '@angular/core/testing';

import { ResourceblockingService } from './resourceblocking.service';

describe('ResourceblockingService', () => {
  let service: ResourceblockingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceblockingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
