import { Component } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { map } from 'rxjs';
import { TelemetryService } from '../services/telemetry.service';

@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.page.html',
  styleUrls: ['./telemetry.page.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelemetryPage {
  // that's what you're supposed to do :D async pipe

  // 👇 You can make telemetry public. but I prefer doing this so I can keep things easy for testing
  readonly position$ = this.telemetry.position$;
  readonly speed$ = this.telemetry.speed$.pipe(map((val) => val*2.23694));
  readonly timestamp$ = this.telemetry.timestamp$;

  constructor(
    private telemetry: TelemetryService,
  ) { }

  async speak() {
    await TextToSpeech.speak({
      text: 'Test',
      lang: 'en_US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'playback',
    });
  }

}
