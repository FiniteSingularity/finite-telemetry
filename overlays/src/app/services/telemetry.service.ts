import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  bufferCount,
  delay,
  filter,
  retryWhen,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { RawTelemetry, Telemetry } from '../models/telemetry';

export interface Position {
  lat: number;
  lng: number;
  alt: number
}

export interface CurrentRun {
  maxAltitude: number;
  minAltitude: number;
  distance: number;
  provDistance: number;
  provAltitude: number;
  lastPosition: Position;
}

export interface CurrentLift {
  minAltitude: number;
  maxAltitude: number;
  distance: number;
  provDistance: number;
  provAltitude: number;
  lastPosition: Position;
}

export interface TelemetryState {
  ws: WebSocketSubject<RawTelemetry> | null;
  telemetry: Telemetry | null;
  maxAltitude: number;
  minAltitude: number;
  maxSessionAltitude: number;
  maxSpeed: number;
  skiing: boolean;
  runStart: number;
  runs: number;
  distance: number;
  vertDistance: number;
  currentRun: CurrentRun | null;
  currentLift: CurrentLift | null;
}

export interface TelemetryCommand {
  command: string;
  minAlt?: number;
  maxAlt?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService extends ComponentStore<TelemetryState> {
  readonly ws$ = this.select((s) => s.ws);
  readonly allData$ = this.select((s) => s);
  readonly telemetry$ = this.select((s) => s.telemetry);
  readonly maxAltitude$ = this.select((s) => s.maxAltitude);
  readonly minAltitude$ = this.select((s) => s.minAltitude);
  readonly maxSpeed$ = this.select((s) => s.maxSpeed);
  readonly runStart$ = this.select((s) => s.runStart);
  readonly altitudeRange$ = this.select((s) => ({
    maxAltitude: s.maxAltitude,
    minAltitude: s.minAltitude
  }));
  readonly altitudeSpecs$ = this.select((s) => {
    return {
      maxAltitude: s.maxAltitude,
      minAltitude: s.minAltitude,
      curAltitude: s.telemetry?.altitude,
    };
  });
  readonly skiing$ = this.select((s) => s.skiing);
  readonly altitude$ = this.select((s) => {
    return s.telemetry?.altitude;
  });
  readonly runs$ = this.select((s) => s.runs);
  readonly distance$ = this.select((s) => {
    if(s.currentRun) {
      return s.distance + s.currentRun.distance + s.currentRun.provDistance;
    } else {
      return s.distance;
    }
  });
  readonly vert$ = this.select((s) => {
    if(s.currentRun) {
      return s.vertDistance + (s.currentRun.maxAltitude - s.currentRun.minAltitude);
    } else {
      return s.vertDistance;
    }
  })

  maxSpeed = 0;
  minAltitude = 1000;
  maxAltitude = 0;
  maxSessionAltitude = 0;

  constructor() {
    super({
      ws: null,
      telemetry: null,
      maxAltitude: 0,
      minAltitude: 1000,
      maxSessionAltitude: 0,
      maxSpeed: 0,
      skiing: false,
      runStart: 0,
      runs: 0,
      distance: 0,
      vertDistance: 0,
      currentRun: null,
      currentLift: null,
    });
    this.prepareWebSocket(
      environment.telemetryServer.replace('http', 'ws'),
      environment.telemetryToken
    );
    this.handleWsConnection(this.ws$);
  }

  readonly disconnect = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.ws$),
      tap(([, ws]) => {
        if (ws) {
          ws.complete();
        }
        this.patchState({ ws: null });
      })
    )
  );

  readonly handleWsConnection = this.effect<TelemetryState['ws']>((ws$) =>
    ws$.pipe(
      filter((ws): ws is Exclude<TelemetryState['ws'], null> => ws !== null),
      switchMap((ws) =>
        ws.pipe(
          retryWhen((errors) => {
            console.log('Disconnected!  Attempting reconnection shortly...');
            return errors.pipe(delay(2000));
          }),
          tap({
            next: (telemetry: RawTelemetry | TelemetryCommand) => {
              if ('command' in telemetry) {
                switch(telemetry.command) {
                  case 'update-altitude':
                    this.minAltitude = telemetry.minAlt! * 0.3048;
                    this.maxAltitude = telemetry.maxAlt! * 0.3048;
                    this.patchState({
                      maxAltitude: this.maxAltitude,
                      minAltitude: this.minAltitude,
                    });
                    break;
                  case 'reset-overlay':
                    location.reload();
                    break;
                }
                return;
              }
              const { altitude_accuracy, timestamp, ...remaining } = telemetry;
              this.maxSpeed = Math.max(this.maxSpeed, telemetry.speed);
              this.maxAltitude =
                remaining.altitude > this.maxAltitude
                  ? remaining.altitude
                  : this.maxAltitude;
              this.maxSessionAltitude = Math.max(
                remaining.altitude,
                this.maxSessionAltitude
              );
              this.patchState({
                telemetry: {
                  altitudeAccuracy: altitude_accuracy,
                  timestamp: new Date(timestamp).getTime(),
                  ...remaining,
                  speed: remaining.speed ?? 0.0,
                  offset: 0,
                },
                maxSpeed: this.maxSpeed,
                maxAltitude: this.maxAltitude,
                maxSessionAltitude: this.maxSessionAltitude,
              });
              const currentLift = this.get().currentLift;
              const currentRun = this.get().currentRun;
              const currentPosition = {lat: telemetry.latitude, lng: telemetry.longitude, alt: telemetry.altitude};
              if(currentLift === null && currentRun === null) {
                this.patchState({
                  currentRun: {
                    distance: 0,
                    provDistance: 0,
                    provAltitude: 0,
                    maxAltitude: telemetry.altitude,
                    minAltitude: telemetry.altitude,
                    lastPosition: {...currentPosition}
                  }
                });
              } else if(currentRun !== null && (telemetry.altitude - currentRun.minAltitude) > 6.0) { // switch to lift
                const runDistance = currentRun.distance;
                const provDistance = currentRun.provDistance + this.distanceCalc(currentPosition, currentRun.lastPosition);
                this.patchState({
                  distance: this.get().distance + runDistance,
                  vertDistance: this.get().vertDistance + (currentRun.maxAltitude - currentRun.minAltitude),
                  runs: this.get().runs + 1,
                  currentRun: null,
                  currentLift: {
                    distance: provDistance,
                    provDistance: 0,
                    provAltitude: 0,
                    maxAltitude: telemetry.altitude,
                    minAltitude: currentRun.minAltitude,
                    lastPosition: {...currentPosition}
                  }
                });
              } else if(currentRun !== null) {
                const dist = this.distanceCalc(currentPosition, currentRun.lastPosition);
                const distanceDelta = currentRun.minAltitude >= telemetry.altitude ? dist + currentRun.provDistance : 0;
                const provDist = currentRun.minAltitude < telemetry.altitude ? dist + currentRun.provDistance : 0;

                this.patchState({
                  currentRun: {
                    distance: currentRun.distance + distanceDelta,
                    provDistance: provDist,
                    maxAltitude: currentRun.maxAltitude,
                    minAltitude: Math.min(currentRun.minAltitude, telemetry.altitude),
                    provAltitude: 0,
                    lastPosition: {...currentPosition}
                  }
                })
              } else if(currentLift !== null && (currentLift.maxAltitude - telemetry.altitude) > 6.0) {
                const provDistance = currentLift.provDistance + this.distanceCalc(currentPosition, currentLift.lastPosition);
                this.patchState({
                  currentLift: null,
                  currentRun: {
                    distance: provDistance,
                    provDistance: 0,
                    provAltitude: 0,
                    maxAltitude: currentLift.maxAltitude,
                    minAltitude: telemetry.altitude,
                    lastPosition: {...currentPosition}
                  }
                });
              } else if(currentLift !== null) {
                const dist = this.distanceCalc(currentPosition, currentLift.lastPosition);
                const distanceDelta = currentLift.maxAltitude <= telemetry.altitude ? dist + currentLift.provDistance : 0;
                const provDist = currentLift.minAltitude > telemetry.altitude ? dist + currentLift.provDistance : 0;
                this.patchState({
                  currentRun: {
                    distance: currentLift.distance + distanceDelta,
                    provDistance: provDist,
                    maxAltitude: Math.max(currentLift.maxAltitude, telemetry.altitude),
                    minAltitude: currentLift.minAltitude,
                    provAltitude: 0,
                    lastPosition: {...currentPosition}
                  }
                })
              }
            },
            finalize: () => {
              this.disconnect();
            },
          })
        )
      )
    )
  );

  private distanceCalc(p1: Position, p2: Position) {
    const R = 6371e3; // metres
    const φ1 = p1.lat * Math.PI/180; // φ, λ in radians
    const φ2 = p2.lat * Math.PI/180;
    const Δφ = (p2.lat-p1.lat) * Math.PI/180;
    const Δλ = (p2.lng-p1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // in metres
    return Math.sqrt(Math.pow(d,2)+Math.pow(p2.alt-p1.alt, 2));
  }

  private prepareWebSocket(url: string, token: string) {
    const endpoint = `${url}/ws/telemetry/output/`;
    this.patchState({
      ws: webSocket({
        url: endpoint,
        openObserver: {
          next: () => {
            console.log(`connected to websocket at ${endpoint}`);
            this.get((s) => s.ws)?.next({ token: token } as any);
          },
        },
      }),
    });
  }
}
