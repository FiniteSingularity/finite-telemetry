import { Component, OnInit } from '@angular/core';
import { TelemetryService } from 'src/app/services/telemetry.service';

@Component({
  selector: 'app-altimeter',
  templateUrl: './altimeter.component.html',
  styleUrls: ['./altimeter.component.scss'],
})
export class AltimeterComponent implements OnInit {
  altData$ = this.telemetry.altitudeSpecs$;

  distanceConv = 3.28084;
  distanceLabel = 'ft';

  constructor(private telemetry: TelemetryService) {}

  ngOnInit(): void {}

  altInRange(minAlt: number, maxAlt: number, curAlt: number) {
    const pct = 1.0-((curAlt - minAlt)) / (maxAlt - minAlt);
    const range = document.getElementById("vertical-meter")!.clientHeight;
    return { 'top.px': 62+pct*(range-14) };
  }
}
