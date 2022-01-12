import { Injectable } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Observable, Subject } from 'rxjs';
import { TAUClient, TAUEvent, TwitchChatMessage } from '../lib/tau-client';
import { ChannelPointRedemption, Cheer, Follow, GiftSub, Raid, Sub } from '../models/tau-events.models';

@Injectable({
  providedIn: 'root'
})
export class TwitchChatService {
  tauEvent$: Observable<TAUEvent>;
  tau = new TAUClient();
  tts = true;
  speaking = false;
  chatEvent$ = new Subject<TAUEvent>();
  chatEvents: TAUEvent[] = [];
  ttsEvents: string[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.tau.connect();
    this.tauEvent$ = this.tau.tauEvent;
    this.tauEvent$.subscribe((event) => {
        switch(event.eventType) {
          case 'TwitchChatMessage':
            console.log('chat message');
            this.processChatMessage(event);
            break;
          case 'ChannelPointRedemption':
            this.processChannelPointRedemption(event);
            break;
          case 'Cheer':
            this.processCheer(event);
            break;
          case 'Raid':
            this.processRaid(event);
            break;
          case 'Sub':
            this.processSub(event);
            break;
          case 'GiftSub':
            this.processGiftSubs(event);
            break;
          case 'Follow':
            this.processFollow(event);
        }
      }
    );
  }

  handleEvent(event: TAUEvent) {
    this.chatEvent$.next(event);
    this.chatEvents = [...this.chatEvents, event];
  }

  handleTTS(message: string) {
    if(this.tts) {
      this.ttsEvents.push(message);
      if(!this.speaking) {
        this.speakNextMessage();
      }
    }
  }

  async speakNextMessage() {
    this.speaking = true;
    while(this.ttsEvents.length > 0) {
      const message = this.ttsEvents.splice(0, 1);
      await TextToSpeech.speak({
        text: message[0],
        lang: 'en_US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'playback',
      });
    }
    this.speaking = false;
  }

  processChatMessage(event: TAUEvent) {
    this.handleEvent(event);
    this.handleTTS(`${(event.event as TwitchChatMessage).tags['display-name']} said. ${event.event['message-text']}`);
  }

  processChannelPointRedemption(event: TAUEvent) {
    this.handleEvent(event);
    const cpr = event.event as ChannelPointRedemption;

    const ttsString = `${cpr.user_name} redeemed ${cpr.reward.title}`;
    const ttsStringMsg = cpr.user_input !== '' ? `. ${cpr.user_input}` : '';
    this.handleTTS(`${ttsString} ${ttsStringMsg}`);
  }

  processCheer(event: TAUEvent) {
    this.handleEvent(event);
    const cheer = event.event as Cheer;
    this.handleTTS(`${cheer.user_name} cheered ${cheer.bits} bits.`);
  }

  processRaid(event: TAUEvent) {
    this.handleEvent(event);
    const raid = event.event as Raid;
    this.handleTTS(`${raid.from_broadcaster_user_name} raided with ${raid.viewers} viewers.`);
  }

  processSub(event: TAUEvent) {
    this.handleEvent(event);
    const sub = event.event as Sub;
    const ttsString = `${sub.user_name} subscribed for ${sub.cumulative_months} months.`;
    const ttsStringMsg = sub.message.text !== '' ? `They say: ${sub.message.text}` : '';
    this.handleTTS(`${ttsString}${ttsStringMsg}`);
  }

  processGiftSubs(event: TAUEvent) {
    this.handleEvent(event);
    const giftSub = event.event as GiftSub;
    this.handleTTS(`${giftSub.user_name} just gifted ${giftSub.total} subs`);
  }

  processFollow(event: TAUEvent) {
    this.handleEvent(event);
    const follow = event.event as Follow;
    this.handleTTS(`${follow.user_name} just followed.`);
  }
}
