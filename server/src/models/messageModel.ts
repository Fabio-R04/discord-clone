import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./authModel";
import { IServerInvitation, ITextChannel } from "./serverModel";

export interface IMessage extends Document {
    conversation: string;
    user: string | IUser;
    type: string;
    serverInvite?: IServerInvitation;
    server?: string;
    message?: string;
    textChannel?: ITextChannel;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema: Schema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    serverInvite: { type: Schema.Types.ObjectId, ref: "ServerInvitation", required: false },
    server: { type: Schema.Types.ObjectId, ref: "Server", required: false },
    message: { type: String, required: false },
    textChannel: { type: Schema.Types.ObjectId, ref: "TextChannel", required: false }
}, {
    timestamps: true
});

export default mongoose.model<IMessage>("Message", messageSchema);