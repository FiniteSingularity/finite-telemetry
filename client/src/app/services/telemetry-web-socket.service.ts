import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retryWhen, delay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TelemetryWebSocketService {
  baseWsUrl = 'ws://192.168.1.223:8000/ws';
  endpoint = 'telemetry/input/';
  token = '8ad2c74cd3268ae882788b86678f85fa3079f418';
  private ws: WebSocketSubject<unknown> | null = null;

  constructor() { }

  connect(): void {
    if (!this.ws) {
      this.connectJsonWs();
    }
  }

  disconnect(): void {
    this.ws?.complete();
    this.ws = null;
  }

  connectJsonWs(): void {
    try {
      // Create a webSocket subject, connecting to the ws widgets/json endpoint.
      this.ws = webSocket({
        url: `${this.baseWsUrl}/${this.endpoint}`,
        openObserver: {
          next: () => {
            console.log(`Connected to websocket at ${this.baseWsUrl}`);
            this.send({ token: this.token });
          },
        },
      });

      // Add a reconnect if connection dies using rxjs' subject pipe operator
      // then subscribe to any messages received by the subject.
      this.ws
        ?.pipe(
          // If we are disconnected, wait 2s before attempting to reconnect.
          retryWhen((err) => {
            console.log('Disconnected!  Attempting reconnection shortly...');
            return err.pipe(delay(2000));
          }),
        )
        .subscribe(
          // Once we receieve a message from the server, pass it to the handler function.
          (msg) => {
            console.log(msg);
          },
        );
    } catch (err) {
      console.log(err);
    }
  }

  send(payload: any) {
    console.log('sending!');
    this.ws?.next(payload);
  }
}
