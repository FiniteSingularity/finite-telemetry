import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, retryWhen } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import {
  BelaMessage,
  Config,
  Netif,
  Notification,
  Pipelines,
  Revisions,
  Sensors,
  Status,
} from '../models/belabox.models';

@Injectable({
  providedIn: 'root',
})
export class BelaboxRemoteService {
  private sensorsSubject = new BehaviorSubject<Sensors>({
    'SoC temperature': '0.0',
  });
  private netifSubject = new BehaviorSubject<Netif>({});
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private statusSubject = new BehaviorSubject<Status>({
    is_streaming: false,
  });
  private configSubject = new BehaviorSubject<Config>({
    password_hash: '',
    max_br: 0,
    delay: 0,
    pipeline: '',
    srt_latency: 0,
    srt_streamid: '',
    srtla_addr: '',
    srtla_port: '',
    bitrate_overlay: false,
    ssh_pass: '',
    remote_key: '',
  });
  private pipelinesSubject = new BehaviorSubject<Pipelines>({});
  private notificationSubject = new BehaviorSubject<Notification>({ show: [] });

  private ws: WebSocketSubject<BelaMessage> | null = null;

  constructor() {
    this.init();
  }

  get sensors$() {
    return this.sensorsSubject.asObservable();
  }

  get netif$() {
    return this.netifSubject.asObservable();
  }

  get connected$() {
    return this.connectedSubject.asObservable();
  }

  get status$() {
    return this.statusSubject.asObservable();
  }

  get config$() {
    return this.configSubject.asObservable();
  }

  get pipelines$() {
    return this.pipelinesSubject.asObservable();
  }

  get notification$() {
    return this.notificationSubject.asObservable();
  }

  init() {
    this.connect({ url: environment.belaRemoteAddress });
  }

  connect(params: { url: string }) {
    if (!this.ws) {
      this.connectJsonWs(params);
    }
  }

  connectJsonWs(params: { url: string }): void {
    try {
      // Create a webSocket subject, connecting to the ws widgets/json endpoint.
      console.log(`connecting to Bela Websocket`);
      this.ws = webSocket({
        url: params.url,
        openObserver: {
          next: () => {
            console.log(`Connected to Bela Websocket`);
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
          })
        )
        .subscribe(
          // Once we receieve a message from the server, pass it to the handler function.
          (msg) => {
            this.handleMessage(msg);
          }
        );
    } catch (err) {
      console.log(err);
    }
  }

  send(payload: any) {
    this.ws?.next(payload);
  }

  private handleMessage(msg: BelaMessage) {
    Object.keys(msg).forEach((key) => {
      switch (key) {
        case 'sensors': {
          this.sensorsSubject.next(msg[key]);
          break;
        }
        case 'netif': {
          this.netifSubject.next(msg[key]);
          break;
        }
        case 'connected': {
          this.connectedSubject.next(msg[key]);
          break;
        }
        case 'status': {
          this.statusSubject.next(msg[key]);
          break;
        }
        case 'config': {
          this.configSubject.next(msg[key]);
          break;
        }
        case 'pipelines': {
          this.pipelinesSubject.next(msg[key]);
          break;
        }
        case 'notification': {
          this.notificationSubject.next(msg[key]);
          break;
        }
      }
    });
  }
}
