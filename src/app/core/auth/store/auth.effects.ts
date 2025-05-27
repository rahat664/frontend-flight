import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {AuthService} from "../services/auth.service";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, switchMap } from 'rxjs/operators';
import {Router} from "@angular/router";
import {login, loginFailure, loginSuccess} from "./auth.action";

@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions, private authService: AuthService, private router: Router) {
    }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(login),
            mergeMap(({ payload }) =>
                this.authService.login(payload).pipe(
                    map((response: any) =>
                        response.status === 'OK'
                            ? loginSuccess({ response })
                            : loginFailure({ error: response.message })
                    ),
                    catchError(error => of(loginFailure({ error })))
                )
            )
        )
    );
}