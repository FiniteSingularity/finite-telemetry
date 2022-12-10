import { Component, OnInit } from '@angular/core';
import { TelemetryNormalizerService } from 'src/app/services/telemetry-normalizer.service';

const mph = 2.23694;
const kph = 3.6;

@Component({
  selector: 'app-speedometer',
  templateUrl: './speedometer.component.html',
  styleUrls: ['./speedometer.component.scss'],
})
export class SpeedometerComponent implements OnInit {
  telemetry$ = this.telemetry.telemetry$;
  speedScaling = 2.23694;
  speedScaleStr = 'MPH';

  constructor(private telemetry: TelemetryNormalizerService) {}

  ngOnInit(): void {}
}
