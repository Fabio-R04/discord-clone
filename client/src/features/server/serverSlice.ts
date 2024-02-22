import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import serverService, { InviteMemberPayload } from "./serverService";
import { IServer, IServerMember, ITextChannel, ServerState } from "./serverInterfaces";
import { ServerData } from "../../components/NewServer";
import { RootState } from "../../app/store";
import { checkTokenValidity } from "../../reusable";
import { logout } from "../auth/authSlice";
import toast from "react-hot-toast";
import { NewChannelData } from "../../components/NewChannel";
import { InviteMemberData } from "../../components/InviteMembers";
import { IConversation } from "../conversation/conversationInterfaces";
import { JoinServerData } from "../../components/Message";
import { IMessage } from "../message/messageInterfaces";
import { EditServerData } from "../../pages/ServerSettings";

const initialState: ServerState = {
    serverDetails: null,
    serverMembers: [],
    serverMessages: [],
    servers: [],
    channelSelected: null,
    loadingServerAll: false,
    loadingServerCreate: false,
    loadingServerDetails: false,
    loadingServerMembers: false,
    loadingServerMessages: false,
    loadingServerNewChannel: false,
    loadingServerInviteMember: false,
    loadingServerJoin: false,
    loadingServerEditChannel: false,
    loadingServerEditServer: false,
    loadingServerDelete: false,
    successServer: false,
    errorServer: false,
    messageServer: ""
};

// GET
export const getServers = createAsyncThunk("server/all", async (_: void, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.getServers(token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const getServerDetails = createAsyncThunk("server/details", async (serverId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.getServerDetails(serverId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const getServerMembers = createAsyncThunk("server/members", async (serverId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.getServerMembers(serverId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const getServerMessages = createAsyncThunk("server/messages", async (serverId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.getServerMessages(serverId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        thunkAPI.rejectWithValue(message);
    }
});

// POST
export const createServer = createAsyncThunk("server/create", async (data: ServerData, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.createServer(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }

});

export const createChannel = createAsyncThunk("server/new-channel", async (data: NewChannelData, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.createChannel(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const inviteMember = createAsyncThunk("server/invite-member", async (data: InviteMemberData, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.inviteMember(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        thunkAPI.rejectWithValue(message);
    }
});

export const joinServer = createAsyncThunk("server/join-server", async (data: JoinServerData, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.joinServer(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

// PUT
export const editChannel = createAsyncThunk("server/edit-channel", async (data: { channelId: string; newChannelName: string; }, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.editChannel(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const editServer = createAsyncThunk("server/edit-server", async (data: EditServerData, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.editServer(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

// DELETE
export const deleteChannel = createAsyncThunk("server/delete-channel", async (channelId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.deleteChannel(channelId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const deleteServer = createAsyncThunk("server/delete-server", async (serverId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await serverService.deleteServer(serverId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

const serverSlice = createSlice({
    name: "server",
    initialState,
    reducers: {
        resetServer: (state) => {
            state.successServer = false;
            state.errorServer = false;
            state.messageServer = "";
        },
        setChannelSelected: (state, action: PayloadAction<ITextChannel>) => {
            state.channelSelected = action.payload;
        },
        appendServerMessage: (state, action: PayloadAction<IMessage>) => {
            state.serverMessages.push(action.payload);
        },
        handleDeleteServerMessage: (state, action: PayloadAction<IMessage>) => {
            const updatedServerMessages: IMessage[] = state.serverMessages.filter((message: IMessage) => {
                if (message._id !== action.payload._id) {
                    return message;
                }
            });
            state.serverMessages = updatedServerMessages;
        }
    },
    extraReducers: (builder) => {
        builder
            // GET
            .addCase(getServers.pending, (state) => {
                state.loadingServerAll = true;
            })
            .addCase(getServers.fulfilled, (state, action: PayloadAction<IServerMember[]>) => {
                state.loadingServerAll = false;
                state.servers = action.payload;
            })
            .addCase(getServerDetails.pending, (state) => {
                state.loadingServerDetails = true;
            })
            .addCase(getServerDetails.fulfilled, (state, action: PayloadAction<IServer>) => {
                state.loadingServerDetails = false;
                state.serverDetails = action.payload;
            })
            .addCase(getServerMembers.pending, (state) => {
                state.loadingServerMembers = true;
            })
            .addCase(getServerMembers.fulfilled, (state, action: PayloadAction<IServerMember[]>) => {
                state.loadingServerMembers = false;
                state.serverMembers = action.payload;
            })
            .addCase(getServerMessages.pending, (state) => {
                state.loadingServerMessages = true;
            })
            .addCase(getServerMessages.fulfilled, (state, action: PayloadAction<IMessage[] | undefined>) => {
                state.loadingServerMessages = false;
                state.serverMessages = action.payload!;
            })
            // POST
            .addCase(createServer.pending, (state) => {
                state.loadingServerCreate = true;
            })
            .addCase(createServer.fulfilled, (state, action: PayloadAction<IServerMember>) => {
                state.loadingServerCreate = false;
                state.servers.unshift(action.payload);
                state.successServer = true;
                state.messageServer = "SERVER CREATED";
                toast.success("Server Created!");

                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set("serverId", (action.payload.server as IServer)._id);
                window.history.pushState({}, "", `${window.location.pathname}?${urlParams}`);
            })
            .addCase(createServer.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerCreate = false;
                toast.error(action.payload);
            })
            .addCase(createChannel.pending, (state) => {
                state.loadingServerNewChannel = true;
            })
            .addCase(createChannel.fulfilled, (state, action: PayloadAction<ITextChannel>) => {
                state.loadingServerNewChannel = false;
                state.channelSelected = action.payload;
                if (state.serverDetails) {
                    state.serverDetails.textChannels.push(action.payload);
                }
                state.successServer = true;
                state.messageServer = "CHANNEL CREATED";
                toast.success("Channel Created!");
            })
            .addCase(createChannel.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerNewChannel = false;
                toast.error(action.payload);
            })
            .addCase(inviteMember.pending, (state) => {
                state.loadingServerInviteMember = true;
            })
            .addCase(inviteMember.fulfilled, (state, action: PayloadAction<InviteMemberPayload>) => {
                state.loadingServerInviteMember = false;
                toast.success("Invitation Sent!");
            })
            .addCase(inviteMember.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerInviteMember = false;
                toast.error(action.payload);
            })
            .addCase(joinServer.pending, (state) => {
                state.loadingServerJoin = true;
            })
            .addCase(joinServer.fulfilled, (state, action: PayloadAction<IServerMember>) => {
                state.loadingServerJoin = false;
                state.servers.unshift(action.payload);
                state.successServer = true;
                state.messageServer = `JOIN-${(action.payload.server as IServer)._id}`;
                toast.success("Joined Server!");
            })
            .addCase(joinServer.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerJoin = false;
                toast.error(action.payload);
            })
            // PUT
            .addCase(editChannel.pending, (state) => {
                state.loadingServerEditChannel = true;
            })
            .addCase(editChannel.fulfilled, (state, action: PayloadAction<ITextChannel>) => {
                state.loadingServerEditChannel = false;
                if (state.serverDetails) {
                    const length: number = state.serverDetails.textChannels.length;
                    for (let i = 0; i < length; i++) {
                        if (state.serverDetails.textChannels[i]._id === action.payload._id) {
                            state.serverDetails.textChannels[i] = action.payload;
                            break;
                        }
                    }
                }
                state.successServer = true;
                state.messageServer = "CHANNEL EDIT";
                toast.success("Channel edited successfully.");
            })
            .addCase(editChannel.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerEditChannel = action.payload;
                toast.error(action.payload);
            })
            .addCase(editServer.pending, (state) => {
                state.loadingServerEditServer = true;
            })
            .addCase(editServer.fulfilled, (state, action: PayloadAction<{
                serverId: string;
                newServerName: string;
                newServerPicture: {
                    present: boolean;
                    image: string;
                };
            }>) => {
                state.loadingServerEditServer = false;
                if (state.serverDetails) {
                    state.serverDetails.serverName = action.payload.newServerName;
                    state.serverDetails.serverPicture = action.payload.newServerPicture;
                }
                for (let i = 0; i < state.servers.length; i++) {
                    const serverId: string = (state.servers[i].server as IServer)._id;
                    if (serverId === action.payload.serverId) {
                        (state.servers[i].server as IServer).serverName = action.payload.newServerName;
                        (state.servers[i].server as IServer).serverPicture = action.payload.newServerPicture;
                        break;
                    }
                }
                toast.success("Settings Saved!");
            })
            .addCase(editServer.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerEditServer = false;
                toast.error(action.payload);
            })
            // DELETE
            .addCase(deleteChannel.pending, (state) => {
                state.loadingServerEditChannel = true;
            })
            .addCase(deleteChannel.fulfilled, (state, action: PayloadAction<ITextChannel>) => {
                state.loadingServerEditChannel = false;
                if (state.serverDetails) {
                    const updatedChannels: ITextChannel[] = state.serverDetails.textChannels.filter((channel: ITextChannel) => {
                        if (channel._id !== action.payload._id) {
                            return channel;
                        }
                    });
                    state.serverDetails.textChannels = updatedChannels;
                }
                state.successServer = true;
                state.messageServer = "CHANNEL EDIT";
                toast.success("Channel deleted.");
            })
            .addCase(deleteChannel.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerEditChannel = false;
                toast.error(action.payload);
            })
            .addCase(deleteServer.pending, (state) => {
                state.loadingServerDelete = true;
            })
            .addCase(deleteServer.fulfilled, (state, action: PayloadAction<string>) => {
                state.loadingServerDelete = false;
                state.serverDetails = null;
                state.serverMessages = [];
                state.serverMembers = [];
                state.channelSelected = null;
                const updatedServers: IServerMember[] = state.servers.filter((serverMember: IServerMember) => {
                    if ((serverMember.server as IServer)._id !== action.payload) {
                        return serverMember;
                    }
                });
                state.servers = updatedServers;
                state.successServer = true;
                state.messageServer = "SERVER DELETED";
                toast.success("Server Deleted");
            })
            .addCase(deleteServer.rejected, (state, action: PayloadAction<any>) => {
                state.loadingServerDelete = false;
                toast.error(action.payload);
            })
    }
});

export const {
    resetServer,
    setChannelSelected,
    appendServerMessage,
    handleDeleteServerMessage
} = serverSlice.actions;
export default serverSlice.reducer;