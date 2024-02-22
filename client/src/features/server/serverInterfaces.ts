import { IUser } from "../auth/authInterface";
import { IMessage } from "../message/messageInterfaces";

export interface IServer {
    _id: string;
    serverOwner: IUser;
    serverName: string;
    serverPicture: {
        present: boolean;
        image: string;
    };
    textChannels: ITextChannel[];
    members: IUser[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITextChannel {
    _id: string;
    server: string | IServer;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IServerMember {
    _id: string;
    server: string | IServer;
    user: string | IUser;
    createdAt: Date;
    updatedAt: Date;
}

export interface IServerInvitation {
    _id: string;
    server: string | IServer;
    status: string;
    targetUser: string | IUser;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServerState {
    serverDetails: IServer | null;
    serverMembers: IServerMember[];
    serverMessages: IMessage[];
    servers: IServerMember[];
    channelSelected: ITextChannel | null;
    loadingServerAll: boolean;
    loadingServerCreate: boolean;
    loadingServerDetails: boolean;
    loadingServerMembers: boolean;
    loadingServerMessages: boolean;
    loadingServerNewChannel: boolean;
    loadingServerInviteMember: boolean;
    loadingServerJoin: boolean;
    loadingServerEditChannel: boolean;
    loadingServerEditServer: boolean;
    loadingServerDelete: boolean;
    successServer: boolean;
    errorServer: boolean;
    messageServer: string;
}