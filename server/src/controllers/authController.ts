import { Request, Response } from "express";
import UserM, { IUser } from "../models/authModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { FriendsListM } from "../models/friendModel";
import fs from "fs";
import { promisify } from "util";
import path from "path";

const unlinkAsync = promisify(fs.unlink);

// REUSABLE
const genToken = (id: string): string => {
    const jwtSecret: string = `${process.env.JWT_SECRET}`;
    return jwt.sign({ id }, jwtSecret, { expiresIn: "24h" });
}

export const genDefaultProfilePicture = (): string => {
    const colors: string[] = ["blue", "green", "grey", "red", "yellow"];
    const randomColor: string = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
}

// POST
export const register = async (req: Request, res: Response): Promise<void> => {
    const { displayName, username, email, password } = req.body;

    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
        res.status(400).json({
            error: "Don't leave empty fields."
        });
        return;
    }

    try {
        const alreadyExists = await UserM.exists({ email });
        if (alreadyExists) {
            res.status(400).json({
                error: `User with email: '${email}', already exists.`
            });
            return;
        }

        const salt: string = await bcrypt.genSalt(10);
        const hashedPassword: string = await bcrypt.hash(password, salt);

        const newUser: IUser = await UserM.create({
            displayName,
            username,
            email,
            password: hashedPassword,
            hasProfilePicture: {
                present: false,
                color: genDefaultProfilePicture(),
                image: ""
            }
        });

        await FriendsListM.create({
            user: newUser._id,
        });

        res.status(201).json({
            _id: newUser._id,
            displayName: newUser.displayName,
            username: newUser.username,
            email: newUser.email,
            pronouns: newUser.pronouns,
            bannerColor: newUser.bannerColor,
            aboutMe: newUser.aboutMe,
            createdAt: newUser.createdAt,
            hasProfilePicture: newUser.hasProfilePicture,
            token: genToken(newUser._id)
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to register."
        })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            error: "Don't leave empty fields."
        });
        return;
    }

    try {
        const user: IUser | null = await UserM.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(201).json({
                _id: user._id,
                displayName: user.displayName,
                username: user.username,
                email: user.email,
                pronouns: user.pronouns,
                bannerColor: user.bannerColor,
                aboutMe: user.aboutMe,
                createdAt: user.createdAt,
                hasProfilePicture: user.hasProfilePicture,
                token: genToken(user._id)
            });
            return;
        }

        res.status(400).json({
            error: "Email or password is incorrect."
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to login."
        });
    }
}

// PUT
export const editProfile = async (req: Request, res: Response): Promise<void> => {
    const { removeImage, displayName, pronouns, bannerColor, aboutMe } = req.body;

    if (removeImage === undefined) {
        res.status(400).json({
            error: "Remove image status is required."
        });
        return;
    }

    if (req.file) {
        if (req.file.size > 20971520) {
            res.status(400).json({ error: "This file exceeds size limit (20MB)" });
            return;
        }
    }

    try {
        const user: IUser = req.user;
        user.displayName = (displayName || user.displayName);
        user.pronouns = (pronouns || user.pronouns);
        user.bannerColor = (bannerColor || user.bannerColor);
        user.aboutMe = (aboutMe || user.aboutMe);

        if (JSON.parse(removeImage) && user.hasProfilePicture.present && !req.file) {
            await unlinkAsync(path.resolve(__dirname, "..", "..", "public", "images", user.hasProfilePicture.image));
            user.hasProfilePicture.present = false;
            user.hasProfilePicture.image = "";
        } else if (req.file) {
            if (user.hasProfilePicture.present) {
                await unlinkAsync(path.resolve(__dirname, "..", "..", "public", "images", user.hasProfilePicture.image));
            }

            user.hasProfilePicture.present = true;
            user.hasProfilePicture.image = req.file.filename;
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({
            error: "Failed to edit profile."
        });
    }
}