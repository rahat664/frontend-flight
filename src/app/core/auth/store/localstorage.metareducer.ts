import {ActionReducer, INIT, MetaReducer, UPDATE} from "@ngrx/store";

export function rehydrateReducer(reducer: ActionReducer<any>) : ActionReducer<any>  {
    return function (state,action) {
        if (action.type === INIT || action.type === UPDATE) {
            try {
                const user = localStorage.getItem('user');
                if (user) {
                    const parsedUser = JSON.parse(user);
                    const newState = reducer(state, parsedUser);
                    return {
                        ...newState,
                        auth: {
                            ...newState.auth,
                            user: parsedUser,
                            loading: false
                        }
                    };
                }
            } catch (error) {
                console.error('Error rehydrating state from localStorage:', error);
            }
        }
        return reducer(state, action);
    }
}

export const metaReducers : MetaReducer<any>[] = [rehydrateReducer];