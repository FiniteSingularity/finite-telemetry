import { Injectable } from '@angular/core';
import { delay, retryWhen, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  TAUEvent,
  TAUTwitchEvent,
  TwitchChatMessage,
} from '../models/tau-events.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TauService {
  tauEvent$ = new Subject<TAUEvent>();

  private ircWS: WebSocketSubject<unknown> | null = null;
  private eventWS: WebSocketSubject<unknown> | null = null;

  connParams$ = this.auth.tauConnection$;

  constructor(private auth: AuthService) {
    console.log('TauService Constructor');
    this.auth.patchState({ tauConnected: false });
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

  connect(params: { url: string; token: string }) {
    if (this.ircWS === null) {
      this.connectTauIrc(params);
    }
    if (this.eventWS === null) {
      this.connectTauEvents(params);
    }
  }

  get tauEvent() {
    return this.tauEvent$.asObservable();
  }

  disconnect(): void {
    this.ircWS?.complete();
    this.ircWS = null;
    this.eventWS?.complete();
    this.eventWS = null;
    this.auth.patchState({ tauConnected: false });
  }

  sendIrc(payload: any) {
    this.ircWS?.next(payload);
  }

  sendEvent(payload: any) {
    this.eventWS.next(payload);
  }

  connectTauEvents(params: { url: string; token: string }) {
    try {
      this.eventWS = webSocket({
        url: `${params.url.replace('http', 'ws')}/ws/twitch-events/`,
        openObserver: {
          next: () => {
            console.log(
              `Connected to websocket at ${params.url.replace(
                'http',
                'ws'
              )}/ws/twitch-events/`
            );
            this.auth.patchState({ tauConnected: true });
            this.sendEvent({ token: params.token });
          },
        },
      });

      this.eventWS
        ?.pipe(
          // If we are disconnected, wait 2s before attempting to reconnect.
          retryWhen((err) => {
            console.log('Disconnected!  Attempting reconnection shortly...');
            this.auth.patchState({ tauConnected: false });
            return err.pipe(delay(2000));
          })
        )
        .subscribe(
          // Once we receieve a message from the server, pass it to the handler function.
          (msg: TAUTwitchEvent) => {
            const event: TAUEvent = {
              eventType: null,
              event: null,
              timestamp: new Date(),
            };
            switch (msg.event_type) {
              case 'channel-channel_points_custom_reward_redemption-add':
                console.log('setting up ChannelPointRedemption');
                event.eventType = 'ChannelPointRedemption';
                break;
              case 'channel-cheer':
                event.eventType = 'Cheer';
                break;
              case 'channel-follow':
                event.eventType = 'Follow';
                break;
              case 'channel-raid':
                event.eventType = 'Raid';
                break;
              case 'channel-subscription-gift':
                event.eventType = 'GiftSub';
                break;
              case 'channel-subscription-message':
                event.eventType = 'Sub';
                break;
            }
            event.event = msg.event_data;
            if (event.eventType !== null) {
              this.tauEvent$.next(event);
            }
          }
        );
    } catch (err) {
      console.log(err);
    }
  }

  connectTauIrc(params: { url: string; token: string }) {
    try {
      // Create a webSocket subject, connecting to the ws widgets/json endpoint.
      this.ircWS = webSocket({
        url: `${params.url.replace('http', 'ws')}/ws/irc-messages/`,
        openObserver: {
          next: () => {
            console.log(
              `Connected to websocket at ${params.url.replace(
                'http',
                'ws'
              )}/ws/irc-messages/`
            );
            this.sendIrc({ token: params.token });
          },
        },
      });

      // Add a reconnect if connection dies using rxjs' subject pipe operator
      // then subscribe to any messages received by the subject.
      this.ircWS
        ?.pipe(
          // If we are disconnected, wait 2s before attempting to reconnect.
          retryWhen((err) => {
            console.log('Disconnected!  Attempting reconnection shortly...');
            return err.pipe(delay(2000));
          })
        )
        .subscribe(
          // Once we receieve a message from the server, pass it to the handler function.
          (msg: TwitchChatMessage) => {
            this.tauEvent$.next({
              eventType: 'TwitchChatMessage',
              event: msg,
              timestamp: new Date(),
            });
          }
        );
    } catch (err) {
      console.log(err);
    }
  }
}
