import { IUser } from "../auth/authInterface";

export interface FriendRequest {
    _id: string;
    receiver: string | IUser;
    sender: string | IUser;
    createdAt: Date;
}

export interface FriendsList {
    _id: string;
    user: string;
    friendsList: IUser[];
}

export interface FriendState {
    onlineFriends: IUser[];
    filteredOnlineFriends: IUser[];
    allFriends: FriendsList | null;
    filteredAllFriends: IUser[];
    pendingFriendRequests: FriendRequest[];
    filteredFriendRequests: FriendRequest[];
    activeUsers: Record<string, string> | null;
    loadingFriendAll: boolean;
    loadingFriendRequests: boolean;
    loadingFriendRequest: boolean;
    loadingFriendAccept: boolean;
    loadingFriendReject: boolean;
    loadingFriendRemove: boolean;
    successFriend: boolean;
    errorFriend: boolean;
    messageFriend: string;
}