import {createReducer, on} from "@ngrx/store";
import {login, loginFailure, loginSuccess, loginUsingPhoneNumber, logout} from "./auth.action";

export interface AuthState {
    user: any;
    error: any;
    loading: boolean;
}


export const initialState: AuthState = {
    user: null,
    error: null,
    loading: false
}


export const authReducer = createReducer(
    initialState,
    on(login, state => ({...state, loading: true})),
    on(loginUsingPhoneNumber, state => ({...state, loading: true})),
    on(loginSuccess, (state, {response}) => ({
            ...state,
            user: response.data,
            loading: false
        }),
    ),
    on(loginFailure, (state, {error}) => ({
            ...state,
            error: error,
            loading: false
        })
    ),
    on(logout, state => ({
            ...state,
            user: null,
            error: null,
            loading: false
        })
    )
)