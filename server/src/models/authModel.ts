import mongoose, { Schema, Document } from "mongoose";
import { genDefaultProfilePicture } from "../controllers/authController";

export interface HasProfilePicture {
    present: boolean;
    color: string;
    image: string;
}

export interface IUser extends Document {
    displayName: string;
    username: string;
    email: string;
    password: string;
    pronouns: string;
    bannerColor: string;
    aboutMe: string;
    hasProfilePicture: HasProfilePicture;
    createdAt: Date;
}

const authSchema: Schema = new Schema({
    displayName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pronouns: { type: String, required: false, default: "" },
    bannerColor: { type: String, required: false, default: "#000000" },
    aboutMe: { type: String, required: false, default: "" },
    hasProfilePicture: {
        type: {
            present: Boolean,
            color: String,
            image: String
        }, required: true, _id: false
    }
}, {
    timestamps: true
});

export default mongoose.model<IUser>("User", authSchema);