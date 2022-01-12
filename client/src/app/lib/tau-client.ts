import { delay, retryWhen, Subject } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { ChannelPointRedemption, Cheer, Follow, GiftSub, Raid, Sub, TAUTwitchEvent } from "../models/tau-events.models";

const TAU_URL = '<WS_URL_HERE>';
const TAU_TOKEN = '<TOKEN HERE>';



export interface TAUEvent {
  eventType: "TwitchChatMessage" | "ChannelPointRedemption" | "Cheer" | "Raid" | "Follow" | "Sub" | "GiftSub";
  event: TwitchChatMessage | ChannelPointRedemption | Cheer | Raid | Follow | Sub | GiftSub;
  timestamp: Date;
}

export interface TwitchChatMessage {
  raw: string;
  tags: TwitchChatTags;
  prefix: string;
  command: string;
  params: string[];
  "message-text": string;
}

export interface TwitchChatTags {
  "badge-info": string;
  badges: string;
  "client-nonce": string;
  color: string;
  "display-name": string;
  emotes: TwitchChatEmote[];
  "first-msg": string;
  flags: string;
  id: string;
  mod: string;
  "room-id": string;
  subscriber: string;
  "tmi-sent-ts": string;
  turbo: string;
  "user-id": string;
  "user-type": string;
}

export interface TwitchChatEmote {
  id: string;
  positions: Array<number[]>;
}

export class TAUClient {
    tauEvent$ = new Subject<TAUEvent>();

    private ircWS: WebSocketSubject<unknown> | null = null;
    private eventWS: WebSocketSubject<unknown> | null = null;

    constructor() {}

    connect() {
      if(this.ircWS === null) {
        this.connectTauIrc();
      }
      if(this.eventWS === null) {
        this.connectTauEvents();
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
    }

    sendIrc(payload: any) {
      this.ircWS?.next(payload);
    }

    sendEvent(payload: any) {
      this.eventWS.next(payload);
    }

    connectTauEvents() {
      try {
        this.eventWS = webSocket({
          url: `${TAU_URL}/ws/twitch-events/`,
          openObserver: {
            next: () => {
              console.log(`Connected to websocket at ${TAU_URL}/ws/twitch-events/`);
              this.sendEvent({ token: TAU_TOKEN });
            },
          },
        });
        this.eventWS
          ?.pipe(
            // If we are disconnected, wait 2s before attempting to reconnect.
            retryWhen((err) => {
              console.log('Disconnected!  Attempting reconnection shortly...');
              return err.pipe(delay(2000));
            }),
          )
          .subscribe(
            // Once we receieve a message from the server, pass it to the handler function.
            (msg: TAUTwitchEvent) => {
              const event: TAUEvent = {
                eventType: null,
                event: null,
                timestamp: new Date()
              };
              switch(msg.event_type) {
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
              if(event.eventType !== null) {
                console.log('emitting');
                this.tauEvent$.next(event);
              }
            },
          );

      } catch (err) {
        console.log(err);
      }
    }

    connectTauIrc() {
      try {
        // Create a webSocket subject, connecting to the ws widgets/json endpoint.
        this.ircWS = webSocket({
          url: `${TAU_URL}/ws/irc-messages/`,
          openObserver: {
            next: () => {
              console.log(`Connected to websocket at ${TAU_URL}/ws/irc-messages/`);
              this.sendIrc({ token: TAU_TOKEN });
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
            }),
          )
          .subscribe(
            // Once we receieve a message from the server, pass it to the handler function.
            (msg: TwitchChatMessage) => {
              this.tauEvent$.next({
                eventType: "TwitchChatMessage",
                event: msg,
                timestamp: new Date()
              })
            },
          );
      } catch (err) {
        console.log(err);
      }
    }
}