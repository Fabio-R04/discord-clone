import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import conversationService from "./conversationService";
import { ConversationState, IConversation } from "./conversationInterfaces";
import { RootState } from "../../app/store";
import { checkTokenValidity } from "../../reusable";
import { logout } from "../auth/authSlice";
import toast from "react-hot-toast";
import { inviteMember } from "../server/serverSlice";
import { InviteMemberPayload } from "../server/serverService";

const initialState: ConversationState = {
    activeConversation: null,
    conversationDetails: null,
    conversations: [],
    loadingConversationDetails: false,
    loadingConversationCreate: false,
    loadingConversationAll: false,
    successConversation: false,
    errorConversation: false,
    messageConversation: ""
}

// GET
export const getConversations = createAsyncThunk("conversation/all", async (_: void, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await conversationService.getConversations(token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const getConversationDetails = createAsyncThunk("conversation/details", async (conversationId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await conversationService.getConversationDetails(conversationId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

// POST
export const createConversation = createAsyncThunk("conversation/create", async (targetUserId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await conversationService.createConversation(targetUserId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

// PUT
export const hideConversation = createAsyncThunk("conversation/hide", async (conversationId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await conversationService.hideConversation(conversationId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

const conversationSlice = createSlice({
    name: "Conversation",
    initialState,
    reducers: {
        resetConversation: (state) => {
            state.successConversation = false;
            state.errorConversation = false;
            state.messageConversation = "";
        },
        setConversations: (state, action: PayloadAction<IConversation[]>) => {
            state.conversations = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // GET
            .addCase(getConversations.pending, (state) => {
                state.loadingConversationAll = true;
            })
            .addCase(getConversations.fulfilled, (state, action: PayloadAction<IConversation[]>) => {
                state.loadingConversationAll = false;
                state.conversations = action.payload;
            })
            .addCase(getConversationDetails.pending, (state) => {
                state.loadingConversationDetails = true;
            })
            .addCase(getConversationDetails.fulfilled, (state, action: PayloadAction<IConversation>) => {
                state.loadingConversationDetails = false;
                state.conversationDetails = action.payload;
            })
            // POST
            .addCase(createConversation.pending, (state) => {
                state.loadingConversationCreate = true;
            })
            .addCase(createConversation.fulfilled, (state, action: PayloadAction<{
                data: IConversation;
                message: string;
            }>) => {
                const { data, message } = action.payload

                state.loadingConversationCreate = false;
                if (message !== "Conversation already exists.") {
                    state.conversations.unshift(data);
                } else {
                    for (let i = 0; i < state.conversations.length; i++) {
                        if (state.conversations[i]._id === action.payload.data._id) {
                            state.conversations[i] = action.payload.data;
                            break;
                        }
                    }
                }
                state.activeConversation = data;
                state.successConversation = true;
                state.messageConversation = "CONVERSATION CREATED";
            })
            .addCase(createConversation.rejected, (state, action: PayloadAction<any>) => {
                state.loadingConversationCreate = false;
                toast.error(action.payload);
            })
            .addCase(inviteMember.fulfilled, (state, action: PayloadAction<InviteMemberPayload>) => {
                if (action.payload.conversationCreated) {
                    state.conversations.unshift(action.payload.conversation);
                }

                state.successConversation = true;
                state.messageConversation = `INVITE-${action.payload.conversation._id}`;
            })
            //PUT
            .addCase(hideConversation.fulfilled, (state, action: PayloadAction<IConversation>) => {
                for (let i = 0; i < state.conversations.length; i++) {
                    if (state.conversations[i]._id === action.payload._id) {
                        state.conversations[i] = action.payload;
                        break;
                    }
                }
            })
    }
});

export const { resetConversation, setConversations } = conversationSlice.actions;
export default conversationSlice.reducer;