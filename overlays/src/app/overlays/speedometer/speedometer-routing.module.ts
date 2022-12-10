import { Routes } from "@angular/router";
import { SpeedometerComponent } from "./speedometer.component";

export const SpeedometerRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: SpeedometerComponent
    }
];
