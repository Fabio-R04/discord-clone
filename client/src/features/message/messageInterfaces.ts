import { IUser } from "../auth/authInterface";
import { IServerInvitation, ITextChannel } from "../server/serverInterfaces";

export interface IMessage {
    _id: string;
    conversation: string;
    user: IUser;
    type: string;
    serverInvite: IServerInvitation;
    server?: string;
    message: string;
    textChannel?: ITextChannel;
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageState {
    messages: IMessage[];
    loadingMessageAll: boolean;
    successMessage: boolean;
    errorMessage: boolean;
    messageMessage: string;
}