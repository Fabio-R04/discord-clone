import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import messageService from "./messageService";
import { IMessage, MessageState } from "./messageInterfaces";
import { RootState } from "../../app/store";
import { checkTokenValidity } from "../../reusable";
import { logout } from "../auth/authSlice";

const initialState: MessageState = {
    messages: [],
    loadingMessageAll: false,
    successMessage: false,
    errorMessage: false,
    messageMessage: ""
}

// GET
export const getMessages = createAsyncThunk("message/all", async (conversationId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await messageService.getMessages(conversationId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        resetMessage: (state) => {
            state.successMessage = false;
            state.errorMessage = false;
            state.messageMessage = "";
        },
        appendMessage: (state, action: PayloadAction<IMessage>) => {
            state.messages.push(action.payload);
        },
        handleMessageDelete: (state, action: PayloadAction<IMessage>) => {
            const updatedMessages: IMessage[] = state.messages.filter((message: IMessage) => {
                if (message._id !== action.payload._id) {
                    return message;
                }
            });
            state.messages = updatedMessages;
        }
    },
    extraReducers: (builder) => {
        builder
            // GET
            .addCase(getMessages.pending, (state) => {
                state.loadingMessageAll = true;
            })
            .addCase(getMessages.fulfilled, (state, action: PayloadAction<IMessage[]>) => {
                state.loadingMessageAll = false;
                state.messages = action.payload;
            })
    }
});

export const { resetMessage, appendMessage, handleMessageDelete } = messageSlice.actions;
export default messageSlice.reducer;