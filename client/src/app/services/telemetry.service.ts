import { Injectable, NgZone } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { switchMap, tap } from 'rxjs';

import {
  BackgroundGeolocationPlugin,
  Location,
} from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { TelemetryWebSocketService } from './telemetry-web-socket.service';
import { TwitchChatService } from './twitch-chat.service';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation'
);

// 384 bits * 5/sec * 3600
export const positionInitialState: Location = {
  time: null,
  latitude: 0.0,
  longitude: 0.0,
  accuracy: 0,
  altitudeAccuracy: 0,
  altitude: 0.0,
  speed: 0.0,
  bearing: 0.0,
};

@Injectable({
  providedIn: 'root',
})
export class TelemetryService extends ComponentStore<Location> {
  readonly timestamp$ = this.select((s) => s.time);
  readonly lat$ = this.select((s) => s.latitude);
  readonly lng$ = this.select((s) => s.longitude);
  readonly altitude$ = this.select((s) => s.altitude);
  readonly speed$ = this.select((s) => s.speed);
  readonly heading$ = this.select((s) => s.bearing);

  readonly position$ = this.select(
    this.lat$,
    this.lng$,
    this.altitude$,
    (lat, lng, alt) => ({
      lat,
      lng,
      alt,
    })
  );

  streamData = false;

  callbackId: string;
  constructor(
    private ws: TelemetryWebSocketService,
    private ngZone: NgZone,
    private twitchChat: TwitchChatService
  ) {
    super(positionInitialState);
  }

  readonly watchPosition = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: 'Cancel to prevent battery drain.',
            requestPermissions: true,
          },
          (location, error) => {
            if (error) {
              if (error.code === 'NOT_AUTHORIZED') {
                if (
                  window.confirm(
                    'This app needs your location, ' +
                      'but does not have permission.\n\n' +
                      'Open settings now?'
                  )
                ) {
                  BackgroundGeolocation.openSettings();
                }
              }
              return console.error(error);
            }
            this.ngZone.run(async () => {
              if (this.streamData) {
                this.ws.send({
                  timestamp: new Date(location.time).toISOString(),
                  latitude: `${location.latitude.toFixed(8)}`,
                  longitude: `${location.latitude.toFixed(8)}`,
                  altitude: location.altitude,
                  accuracy: location.accuracy,
                  altitude_accuracy: location.altitudeAccuracy,
                  speed: location.speed,
                  bearing: location.bearing,
                });
              }
              this.setState({
                ...location,
              });
            });
          }
        );
      }), // this is now Observable<CallbackID>
      tap({
        next: (callbackId: string) => {
          this.callbackId = callbackId;
        },
        finalize: () => {
          // this is tap() (rxjs) specific, not just componentStore. finalize() gets called when
          // the stream is unsubscribed. But when is this stream unsubscribed? When this Service is destroyed.
          // But this service is providedIn at Root level, so it's the Application life-cycle
          BackgroundGeolocation.removeWatcher({ id: this.callbackId });
        },
      })
    )
  );
}
