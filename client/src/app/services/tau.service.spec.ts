import { TestBed } from '@angular/core/testing';

import { TauService } from './tau.service';

describe('TauService', () => {
  let service: TauService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TauService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
