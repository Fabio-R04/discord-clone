import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./authModel";

export interface IServer extends Document {
    serverOwner: IUser;
    serverName: string;
    serverPicture: {
        present: boolean;
        image: string;
    };
    textChannels: string[] | ITextChannel[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITextChannel extends Document {
    _id: string;
    server: string | IServer;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IServerMember extends Document {
    _id: string;
    user: string | IUser;
    server: string | IServer;
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

const serverSchema: Schema = new Schema({
    serverOwner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serverName: { type: String, required: true },
    serverPicture: { type: {
        present: Boolean,
        image: String,
    }, _id: false, required: false, default: { present: false, image: "" } },
    textChannels: { type: [{
        type: Schema.Types.ObjectId,
        ref: "TextChannel"
    }], required: false, default: [] }
}, {
    timestamps: true
});

const textChannelSchema: Schema = new Schema({
    server: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    name: { type: String, required: true }
}, {
    timestamps: true
});

const serverMemberSchema: Schema = new Schema({
    server: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true
});

const serverInvitationSchema: Schema = new Schema({
    server: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    status: { type: String, required: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true
});

export const TextChannelM = mongoose.model<ITextChannel>("TextChannel", textChannelSchema); 
export const ServerMemberM = mongoose.model<IServerMember>("ServerMember", serverMemberSchema);
export const ServerInvitationM = mongoose.model<IServerInvitation>("ServerInvitation", serverInvitationSchema);
export default mongoose.model<IServer>("Server", serverSchema);