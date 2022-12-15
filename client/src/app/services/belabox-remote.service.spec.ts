import { TestBed } from '@angular/core/testing';

import { BelaboxRemoteService } from './belabox-remote.service';

describe('BelaboxRemoteService', () => {
  let service: BelaboxRemoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BelaboxRemoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
