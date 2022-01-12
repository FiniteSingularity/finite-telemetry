import { TestBed } from '@angular/core/testing';

import { TelemetryWebSocketService } from './telemetry-web-socket.service';

describe('TelemetryWebSocketService', () => {
  let service: TelemetryWebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelemetryWebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
