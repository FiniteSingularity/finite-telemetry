import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { forkJoin, switchMap, tap } from 'rxjs';
import { StorageService } from './storage.service';

export interface ServerAuth {
  tauUrl: string;
  tauUser: string;
  tauToken: string;
  tauConnected: boolean;
  telemetryUrl: string;
  telemetryUser: string;
  telemetryToken: string;
  telemetryConnected: boolean;
  obsUrl: string;
  obsPort: number;
  obsPassword: string;
  obsConnected: boolean;
}

export const serverAuthInitialState: ServerAuth = {
  tauUrl: '',
  tauUser: '',
  tauToken: '',
  tauConnected: false,
  telemetryUrl: '',
  telemetryUser: '',
  telemetryToken: '',
  telemetryConnected: false,
  obsUrl: '',
  obsPort: 4444,
  obsPassword: '',
  obsConnected: false,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ComponentStore<ServerAuth> {
  readonly tauUrl$ = this.select((s) => s.tauUrl);
  readonly tauUser$ = this.select((s) => s.tauUser);
  readonly tauToken$ = this.select((s) => s.tauToken);
  readonly tauConnected$ = this.select((s) => s.tauConnected);
  readonly tauConnection$ = this.select(
    this.tauUrl$,
    this.tauToken$,
    (url, token) => ({
      url,
      token,
    })
  );

  readonly telemetryUrl$ = this.select((s) => s.telemetryUrl);
  readonly telemetryUser$ = this.select((s) => s.telemetryUser);
  readonly telemetryToken$ = this.select((s) => s.telemetryToken);
  readonly telemetryConnected$ = this.select((s) => s.telemetryConnected);
  readonly telemetryConnection$ = this.select(
    this.telemetryUrl$,
    this.telemetryToken$,
    (url, token) => ({
      url,
      token,
    })
  );

  constructor(private storage: StorageService) {
    super(serverAuthInitialState);
  }

  readonly load = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() => {
        return forkJoin(
          Object.entries(serverAuthInitialState).reduce(
            (promises, [key, defaultValue]) => {
              if (
                ![
                  'tauConnected',
                  'telemetryConnected',
                  'obsConnected',
                ].includes(key)
              ) {
                promises[key] = this.storage.get(key, defaultValue);
              }
              return promises;
            },
            {}
          )
        ).pipe(tap((state) => this.patchState(state)));
      })
    )
  );

  readonly setupTau = this.effect<{
    tauUrl: string;
    tauUser: string;
    tauToken: string;
  }>((tauConfig$) =>
    tauConfig$.pipe(
      tap((tauConfig) => {
        this.patchState(tauConfig);
        Object.keys(tauConfig).forEach((key) => {
          this.storage.set(key, tauConfig[key]);
        });
      })
    )
  );

  readonly setupTelemetry = this.effect<{
    telemetryUrl: string;
    telemetryUser: string;
    telemetryToken: string;
  }>((telemetryConfig$) =>
    telemetryConfig$.pipe(
      tap((telemetryConfig) => {
        this.patchState(telemetryConfig);
        Object.keys(telemetryConfig).forEach((key) => {
          this.storage.set(key, telemetryConfig[key]);
        });
      })
    )
  );
}
