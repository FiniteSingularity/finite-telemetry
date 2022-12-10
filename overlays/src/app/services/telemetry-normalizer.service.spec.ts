import { TestBed } from '@angular/core/testing';

import { TelemetryNormalizerService } from './telemetry-normalizer.service';

describe('TelemetryNormalizerService', () => {
  let service: TelemetryNormalizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelemetryNormalizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
