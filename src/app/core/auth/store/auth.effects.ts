import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {AuthService} from "../services/auth.service";
import {of} from 'rxjs';
import {catchError, map, mergeMap, tap, switchMap} from 'rxjs/operators';
import {Router} from "@angular/router";
import {login, loginFailure, loginSuccess, loginUsingPhoneNumber, logout} from "./auth.action";

@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions, private authService: AuthService, private router: Router) {
    }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(login),
            mergeMap(({payload}) =>
                this.authService.login(payload).pipe(
                    map((response: any) =>
                        response.status === 'OK'
                            ? loginSuccess({response})
                            : loginFailure({error: response.message})
                    ),
                    catchError(error => of(loginFailure({error})))
                )
            )
        )
    );

    loginUsingPhoneNumber$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loginUsingPhoneNumber),
            mergeMap(({payload}) =>
                this.authService.verifyOtp(payload).pipe(
                    map((response: any) =>
                        response.status === 'OK' ?
                            loginSuccess({response})
                            : loginFailure({error: response.message})
                    ),
                    catchError(error => of(loginFailure({error})))
                )
            )
        )
    )

    loginSuccess$ = createEffect(() =>
            () =>
                this.actions$.pipe(
                    ofType(loginSuccess),
                    switchMap(({response}) => {
                            const user: any = response?.data;
                            if (user?.roles?.includes('ROLE_GSO')) {
                                alert('You are not authorized to login')
                                return of();
                            }
                            localStorage.setItem('user', JSON.stringify(user));
                            this.router.navigate(['/']);
                            return of()
                        }
                    )
                ),
        {dispatch: false}
    )

    logOut$ = createEffect(() =>
            () =>
                this.actions$.pipe(
                    ofType(logout),
                    tap(() => localStorage.clear())
                ),
        {dispatch: false}
    )
}