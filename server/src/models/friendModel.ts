import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./authModel";

export interface FriendRequest extends Document {
    sender: string | IUser;
    receiver: string | IUser;
    createdAt: Date;
}

export interface IFriendsList extends Document {
    user: string | IUser;
    friendsList: string[] | IUser[];
}

const friendRequestSchema: Schema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true
});

const friendsListSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    friendsList: { type: [{ type: Schema.Types.ObjectId, ref: "User", _id: false }], required: false, default: [] }
});

export const FriendsListM = mongoose.model("friend", friendsListSchema);
export default mongoose.model<FriendRequest>("FriendRequest", friendRequestSchema);