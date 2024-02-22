import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from "../features/auth/authSlice";
import friendReducer from "../features/friend/friendSlice";
import conversationReducer from "../features/conversation/conversationSlice";
import messageReducer from "../features/message/messageSlice";
import serverReducer from "../features/server/serverSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        friend: friendReducer,
        conversation: conversationReducer,
        message: messageReducer,
        server: serverReducer
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
