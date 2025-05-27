import {createFeatureSelector, createSelector} from "@ngrx/store";
import {AuthState} from "./auth.reducer";

export const selectAuthState = createFeatureSelector<AuthState>('auth')

export const selectAuthUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.user
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);
export const selectAuthLoading = createSelector(
    selectAuthState,
    (state: AuthState) => state.loading
);
