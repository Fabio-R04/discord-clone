import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import friendService from "./friendService";
import { FriendRequest, FriendState, FriendsList } from "./friendInterfaces";
import { RootState } from "../../app/store";
import { checkTokenValidity } from "../../reusable";
import { logout } from "../auth/authSlice";
import toast from "react-hot-toast";
import { IUser } from "../auth/authInterface";

const initialState: FriendState = {
    onlineFriends: [],
    filteredOnlineFriends: [],
    allFriends: null,
    filteredAllFriends: [],
    pendingFriendRequests: [],
    filteredFriendRequests: [],
    activeUsers: null,
    loadingFriendAll: false,
    loadingFriendRequest: false,
    loadingFriendRequests: false,
    loadingFriendAccept: false,
    loadingFriendReject: false,
    loadingFriendRemove: false,
    successFriend: false,
    errorFriend: false,
    messageFriend: ""
}

// GET
export const getPendingFriendRequests = createAsyncThunk("friend/all-requests", async (_: void, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await friendService.getPendingFriendRequests(token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const getAllFriends = createAsyncThunk("friend/all", async (_: void, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await friendService.getAllFriends(token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

// POST
export const sendFriendRequest = createAsyncThunk("friend/friend-request", async (targetUsername: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await friendService.sendFriendRequest(targetUsername, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const acceptFriendRequest = createAsyncThunk("friend/accept-request", async (senderId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await friendService.acceptFriendRequest(senderId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const rejectFriendRequest = createAsyncThunk("friend/reject-request", async (data: {
    requestId: string;
    senderId: string;
    receiverId: string;
}, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await friendService.rejectFriendRequest(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

export const removeFriend = createAsyncThunk("friend/remove", async (targetId: string, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await friendService.removeFriend(targetId, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

const friendSlice = createSlice({
    name: "friend",
    initialState,
    reducers: {
        resetFriend: (state) => {
            state.successFriend = false;
            state.errorFriend = false;
            state.messageFriend = "";
        },
        setActiveUsers: (state, action: PayloadAction<Record<string, string>>) => {
            state.activeUsers = action.payload;
        },
        getOnlineFriends: (state) => {
            if (state.allFriends && state.activeUsers) {
                const onlineUsers: IUser[] = state.allFriends.friendsList.filter((u: IUser) => {
                    if (state.activeUsers![u._id]) {
                        return u;
                    }
                });

                state.onlineFriends = onlineUsers;
                state.filteredOnlineFriends = state.onlineFriends;
            }
        },
        searchOnlineFriends: (state, action: PayloadAction<string>) => {
            const query: string = action.payload;
            if (query.trim() === "") {
                state.filteredOnlineFriends = state.onlineFriends;
            } else {
                const filteredOnlineFriends: IUser[] = state.onlineFriends.filter((friend: IUser) => {
                    if (friend.displayName.toLowerCase().includes(query.toLowerCase())) {
                        return friend;
                    }
                });
                state.filteredOnlineFriends = filteredOnlineFriends;
            }
        },
        setAllFriends: (state, action: PayloadAction<FriendsList>) => {
            state.allFriends = action.payload;
            state.filteredAllFriends = action.payload.friendsList;
        },
        searchAllFriends: (state, action: PayloadAction<string>) => {
            const query: string = action.payload;
            if (state.allFriends) {
                if (query.trim() === "") {
                    state.filteredAllFriends = state.allFriends.friendsList;
                } else {
                    const filteredAllFriends: IUser[] = state.allFriends.friendsList.filter((friend: IUser) => {
                        if (friend.displayName.toLowerCase().includes(query.toLowerCase())) {
                            return friend;
                        }
                    });
                    state.filteredAllFriends = filteredAllFriends;
                }
            }
        },
        setPendingFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
            state.pendingFriendRequests = action.payload;
            state.filteredFriendRequests = state.pendingFriendRequests;
        },
        searchPendingFriendRequests: (state, action: PayloadAction<{
            query: string;
            userId: string;
        }>) => {
            const { query, userId } = action.payload;
            if (query.trim() === "") {
                state.filteredFriendRequests = state.pendingFriendRequests;
            } else {
                const filteredRequests: FriendRequest[] = state.pendingFriendRequests.filter((request: FriendRequest) => {
                    const sender: IUser = (request.sender as IUser);
                    const receiver: IUser = (request.receiver as IUser);
                    let displayName: string = "";

                    if (userId === sender._id) {
                        displayName = receiver.displayName;
                    } else if (userId === receiver._id) {
                        displayName = sender.displayName;
                    }

                    if (displayName.toLowerCase().includes(query.toLowerCase())) {
                        return request;
                    }
                });
                state.filteredFriendRequests = filteredRequests;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // GET
            .addCase(getAllFriends.pending, (state) => {
                state.loadingFriendAll = true;
            })
            .addCase(getAllFriends.fulfilled, (state, action: PayloadAction<FriendsList>) => {
                state.loadingFriendAll = false;
                state.allFriends = action.payload;
                state.filteredAllFriends = action.payload.friendsList;
            })
            .addCase(getPendingFriendRequests.pending, (state) => {
                state.loadingFriendRequests = true;
            })
            .addCase(getPendingFriendRequests.fulfilled, (state, action: PayloadAction<FriendRequest[]>) => {
                state.loadingFriendRequests = false;
                state.pendingFriendRequests = action.payload;
                state.filteredFriendRequests = action.payload;
            })
            // POST
            .addCase(sendFriendRequest.pending, (state) => {
                state.loadingFriendRequest = true;
            })
            .addCase(sendFriendRequest.fulfilled, (state, action: PayloadAction<{ success: string; outgoingRequest: FriendRequest; }>) => {
                state.loadingFriendRequest = false;
                state.pendingFriendRequests.unshift(action.payload.outgoingRequest);
                state.filteredFriendRequests = state.pendingFriendRequests;
                toast.success(action.payload.success);
            })
            .addCase(sendFriendRequest.rejected, (state, action: PayloadAction<any>) => {
                state.loadingFriendRequest = false;
                toast.error(action.payload);
            })

            .addCase(acceptFriendRequest.pending, (state) => {
                state.loadingFriendAccept = true;
            })
            .addCase(acceptFriendRequest.fulfilled, (state, action: PayloadAction<{ friendRequestId: string; }>) => {
                state.loadingFriendAccept = false;
                const updatedPendingFriendRequests: FriendRequest[] = state.pendingFriendRequests.filter((pendingRequest: FriendRequest) => {
                    if (pendingRequest._id !== action.payload.friendRequestId) {
                        return pendingRequest;
                    } else {
                        if (state.allFriends) {
                            state.allFriends.friendsList.unshift((pendingRequest.sender as IUser));
                            state.filteredAllFriends = state.allFriends.friendsList;
                        }
                    }
                });
                state.pendingFriendRequests = updatedPendingFriendRequests;
                state.filteredFriendRequests = state.pendingFriendRequests;
                state.successFriend = true;
                state.messageFriend = "FRIEND REQUEST ACCEPTED";
                toast.success("Friend request accepted!");
            })
            .addCase(acceptFriendRequest.rejected, (state, action: PayloadAction<any>) => {
                state.loadingFriendAccept = false;
                toast.error(action.payload);
            })
            .addCase(rejectFriendRequest.pending, (state) => {
                state.loadingFriendReject = true;
            })
            .addCase(rejectFriendRequest.fulfilled, (state, action: PayloadAction<{ friendRequestId: string; }>) => {
                state.loadingFriendReject = false;
                const updatedPendingFriendRequests: FriendRequest[] = state.pendingFriendRequests.filter((pendingRequest: FriendRequest) => {
                    if (pendingRequest._id !== action.payload.friendRequestId) {
                        return pendingRequest;
                    }
                });
                state.pendingFriendRequests = updatedPendingFriendRequests;
                state.filteredFriendRequests = state.pendingFriendRequests;
                toast.success("Friend request rejected.");
            })
            .addCase(rejectFriendRequest.rejected, (state, action: PayloadAction<any>) => {
                state.loadingFriendReject = false;
                toast.error(action.payload);
            })
            .addCase(removeFriend.pending, (state) => {
                state.loadingFriendRemove = true;
            })
            .addCase(removeFriend.fulfilled, (state, action: PayloadAction<FriendsList>) => {
                state.loadingFriendRemove = false;
                state.allFriends = action.payload;
                state.filteredAllFriends = action.payload.friendsList;
                state.successFriend = true;
                state.messageFriend = "FRIEND REMOVED";
                toast.success("Friend removed.");
            })
            .addCase(removeFriend.rejected, (state, action: PayloadAction<any>) => {
                state.loadingFriendRemove = false;
                toast.error(action.payload);
            })
    }
});

export const {
    resetFriend,
    setActiveUsers,
    setPendingFriendRequests,
    searchPendingFriendRequests,
    getOnlineFriends,
    searchOnlineFriends,
    setAllFriends,
    searchAllFriends
} = friendSlice.actions;
export default friendSlice.reducer;