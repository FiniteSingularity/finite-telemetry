import {Injectable} from '@angular/core';
import {ComponentStore} from '@ngrx/component-store';
import {forkJoin, Observable, switchMap, tap} from 'rxjs';
import {StorageService} from './storage.service';

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

  readonly tauSettings$: Observable<{ url: string; user: string; token: string; connected: boolean }> = this.select(
    this.tauUrl$,
    this.tauUser$,
    this.tauToken$,
    this.tauConnected$,
    (url, user, token, connected) => ({url, user, token, connected})
  );

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

  readonly telemetrySettings$: Observable<{ url: string; user: string; token: string; connected: boolean }> = this.select(
    this.telemetryUrl$,
    this.telemetryUser$,
    this.telemetryToken$,
    this.telemetryConnected$,
    (url, user, token, connected) => ({url, user, token, connected})
  );

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
      switchMap(() => forkJoin(
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
        ).pipe(tap((state) => this.patchState(state))))
    )
  );

  readonly setup = this.effect<{
    tauUrl: string;
    tauUser: string;
    tauToken: string;
  } | {
    telemetryUrl: string;
    telemetryUser: string;
    telemetryToken: string;
  }>((config$) =>
    config$.pipe(
      tap((config) => {
        this.patchState(config);
        Object.keys(config).forEach((key) => {
          this.storage.set(key, config[key]);
        });
      })
    )
  );
}
