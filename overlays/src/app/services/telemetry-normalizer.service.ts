import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import interp1 from 'interp1';
import { concatAll, concatMap, delay, map, of, pairwise, tap } from 'rxjs';
import { Telemetry } from '../models/telemetry';
import { TelemetryService, TelemetryState } from './telemetry.service';

export interface NormalizedTelemetryState {
  telemetry: Telemetry | null;
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryNormalizerService extends ComponentStore<NormalizedTelemetryState> {
  readonly telemetry$ = this.select((s) => s.telemetry);
  first = true;
  start = 0;
  startOffset = 0;
  step = 200;
  streamOffset = 0; // Output timestep size in ms
  targetOffset = 0;
  error = 0;

  constructor(private telemetry: TelemetryService) {
    super({ telemetry: null });
    this.handleTelemetry(this.telemetry.telemetry$);
  }

  readonly handleTelemetry = this.effect<TelemetryState['telemetry']>(
    (telemetry$) =>
      telemetry$.pipe(
        pairwise(),
        map(([t1, t2]) => {
          let setInitOffset = false;
          if (this.first || t2?.timestamp! - t1?.timestamp! > 10000) {
            console.log('Restarting!');
            setInitOffset = true;
            this.first = false;
            t1 = {
              ...t2!,
              timestamp: t2?.timestamp! - 1000,
            };
            this.streamOffset = new Date().getTime() - (t2?.timestamp! - 1000);
            this.error = 0;
          }
          let ts: number[] = [];
          let i = 0;
          while (t1?.timestamp! + i * this.step < t2?.timestamp!) {
            ts.push(t1?.timestamp! + i * this.step);
            i++;
          }

          const offset = -Math.round((1.5 * this.error) / ts.length);

          const speedInterp = interp1(
            [t1?.timestamp!, t2?.timestamp!],
            [t1?.speed!, t2?.speed!],
            ts
          );
          const altInterp = interp1(
            [t1?.timestamp!, t2?.timestamp!],
            [t1?.altitude!, t2?.altitude!],
            ts
          );

          return ts.map((timestamp, idx): Telemetry => {
            return {
              ...t1!,
              speed: speedInterp[idx],
              altitude: altInterp[idx],
              timestamp,
              offset: setInitOffset && idx === 0 ? this.targetOffset : offset,
            };
          });
        }),
        concatAll(),
        concatMap((val) => of(val).pipe(delay(this.step + val.offset))),
        tap((telemetry) => {
          this.error =
            new Date().getTime() -
            (telemetry?.timestamp! + this.streamOffset + this.targetOffset);
          //console.log(this.error);
          this.setState({ telemetry });
        })
      )
  );
}
