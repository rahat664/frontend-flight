import {ApplicationConfig, provideZoneChangeDetection, isDevMode} from '@angular/core';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';

import {routes} from './app.routes';
import {provideStore} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {provideRouterStore} from '@ngrx/router-store';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {authReducer} from "./core/auth/store/auth.reducer";
import {metaReducers} from "./core/auth/store/localstorage.metareducer";
import {AuthEffects} from "./core/auth/store/auth.effects";
import {provideHttpClient} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({eventCoalescing: true}),
        provideHttpClient(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideStore({auth: authReducer}, {metaReducers}),
        provideEffects([AuthEffects]),
        provideStoreDevtools({
        maxAge: 25,
        logOnly: !isDevMode()
    })]
};
