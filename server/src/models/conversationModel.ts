import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./authModel";
import { IMessage } from "./messageModel";

export interface IConversation extends Document {
    users: string[] | IUser[];
    visible: Visible[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Visible {
    userId: string;
    isVisible: boolean;
}

const conversationSchema: Schema = new Schema({
    users: { type: [{ type: Schema.Types.ObjectId, ref: "User", _id: false }], required: true },
    visible: { type: [{ type: {
        userId: String,
        isVisible: Boolean
    }, _id: false }], required: true }
}, {
    timestamps: true
});

export default mongoose.model<IConversation>("Conversation", conversationSchema);