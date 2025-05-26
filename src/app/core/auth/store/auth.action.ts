import {createAction, props} from "@ngrx/store";
import {LoginRequest, LoginRequestUsingPhone} from "../models/request/login-request.model";
import {ApiResponse} from "../models/response/api-response.model";

export const login = createAction(
    '[Auth] Login',
    props<{payload: LoginRequest}>()
)

export const loginUsingPhoneNumber = createAction(
    '[Auth] Login Using Phone Number',
    props<{payload: LoginRequestUsingPhone}>()
)

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{response: ApiResponse}>()
)

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{error: any}>()
)
export const logout = createAction(
    '[Auth] Logout',
)