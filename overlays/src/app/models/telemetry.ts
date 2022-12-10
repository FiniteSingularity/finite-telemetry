export interface RawTelemetry {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  altitude_accuracy: number;
  speed: number;
  bearing: number;
}

export type Telemetry = Omit<
  RawTelemetry,
  'timestamp' | 'altitude_accuracy'
> & { timestamp: number; altitudeAccuracy: number; offset: number };
