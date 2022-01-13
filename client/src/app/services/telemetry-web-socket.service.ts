import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retryWhen, delay } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TelemetryWebSocketService {
  endpoint = 'ws/telemetry/input/';
  private ws: WebSocketSubject<unknown> | null = null;

  connParams$ = this.auth.telemetryConnection$;

  constructor(private auth: AuthService) {
    this.auth.patchState({ telemetryConnected: false });
    this.init();
  }

  init() {
    this.connParams$.subscribe((params) => {
      console.log('got url!', params.url);
      if (params.token !== '' && params.url !== '') {
        console.log('Calling Connect');
        this.connect(params);
      } else {
        this.disconnect();
      }
    });
  }

  connect(params: { url: string; token: string }): void {
    if (!this.ws) {
      this.connectJsonWs(params);
    }
  }

  disconnect(): void {
    this.ws?.complete();
    this.ws = null;
    this.auth.patchState({ telemetryConnected: false });
  }

  connectJsonWs(params: { url: string; token: string }): void {
    try {
      // Create a webSocket subject, connecting to the ws widgets/json endpoint.
      console.log(
        `connecting to ${params.url.replace('http', 'ws')}/${this.endpoint}`
      );
      this.ws = webSocket({
        url: `${params.url.replace('http', 'ws')}/${this.endpoint}`,
        openObserver: {
          next: () => {
            this.auth.patchState({ telemetryConnected: true });
            console.log(
              `Connected to websocket at ${params.url.replace('http', 'ws')}`
            );
            this.send({ token: params.token });
          },
        },
      });

      // Add a reconnect if connection dies using rxjs' subject pipe operator
      // then subscribe to any messages received by the subject.
      this.ws
        ?.pipe(
          // If we are disconnected, wait 2s before attempting to reconnect.
          retryWhen((err) => {
            this.auth.patchState({ telemetryConnected: false });
            console.log('Disconnected!  Attempting reconnection shortly...');
            return err.pipe(delay(2000));
          })
        )
        .subscribe(
          // Once we receieve a message from the server, pass it to the handler function.
          (msg) => {
            console.log(msg);
          }
        );
    } catch (err) {
      console.log(err);
    }
  }

  send(payload: any) {
    this.ws?.next(payload);
  }
}
