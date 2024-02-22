import { IUser } from "../auth/authInterface";

export interface IConversation {
    _id: string;
    users: IUser[];
    visible: Visible[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Visible {
    userId: string;
    isVisible: boolean;
}

export interface ConversationState {
    activeConversation: IConversation | null;
    conversationDetails: IConversation | null;
    conversations: IConversation[];
    loadingConversationDetails: boolean;
    loadingConversationCreate: boolean;
    loadingConversationAll: boolean;
    successConversation: boolean;
    errorConversation: boolean;
    messageConversation: string;
}