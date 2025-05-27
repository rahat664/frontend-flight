import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../../environments/environment.dev';
import {Router} from "@angular/router";
import {AuthState} from "../store/auth.reducer";
import {Store} from "@ngrx/store";
import {LoginPhoneRequest, LoginRequest, LoginRequestUsingPhone} from "../models/request/login-request.model";
import {Observable, throwError} from "rxjs";
import {ApiResponse} from "../models/response/api-response.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loginUrl = `${environment.userUrl}/auth/login`;
    private verifyOtpUrl = `${environment.userUrl}/auth/verify-otp`;

    constructor(private http: HttpClient, private router: Router, private store: Store<{ auth: AuthState }>) {
    }

    login(payload: LoginRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.loginUrl}`, payload)
    }

    loginUsingPhone(payload: LoginPhoneRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.loginUrl}`, payload);
    }

    verifyOtp(payload: LoginRequestUsingPhone): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.verifyOtpUrl}`, payload);
    }

    // private handleError(error: HttpErrorResponse) {
    //     let errorMessage = 'An unknown error occurred!';
    //     if (error.status === 0) {
    //         errorMessage = 'A network error occurred. Please check your internet connection.';
    //     } else if (error.error instanceof ErrorEvent) {
    //         errorMessage = `An error occurred: ${error.error.message}`;
    //     }
    //     else {
    //         errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
    //     }
    //     return throwError(()=> new Error(errorMessage));
    // }

    logout() {
        localStorage.removeItem('accessToken');
        this.router.navigate(['/auth/login']);
        this.store.dispatch({ type: '[Auth] Logout' }); // Dispatch logout action to clear state
    }

    isLoggedIn() {
        return localStorage.getItem('accessToken') !== null;
    }

    isAdmin() {
        const role = localStorage.getItem('role');
        return role.includes('ROLE_ADMIN') || role.includes('ROLE_KAM'); // Adjust based on your role structure
    }

}
