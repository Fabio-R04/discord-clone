import { Request, Response } from "express";
import ConversationM, { IConversation } from "../models/conversationModel";
import UserM, { IUser } from "../models/authModel";
import FriendM, { FriendsListM, IFriendsList } from "../models/friendModel";
import friendUpdates from "../socketHandlers/friendUpdates";

// GET
export const getConversations = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user._id;

    try {
        const conversations: IConversation[] = await ConversationM.find({
            users: { $in: [userId] }
        }).populate({
            path: "users",
            model: "User",
            select: "-password"
        }).sort({ updatedAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch conversations."
        });
    }
}

export const getConversationDetails = async (req: Request, res: Response): Promise<void> => {
    const conversationId: string = req.params.conversationId;

    try {
        const conversation: IConversation | null = await ConversationM.findById(conversationId)
            .populate({
                path: "users",
                model: "User",
                select: "-password"
            });

        if (!conversation) {
            res.status(400).json({
                error: "Conversation doesn't exist"
            });
            return;
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch conversation details."
        });
    }
}

// POST
export const createConversation = async (req: Request, res: Response): Promise<void> => {
    const targetUserId: string = req.params.targetUserId;
    const userId: string = req.user._id;

    const conversation: IConversation | null = await ConversationM.findOne({
        users: { $all: [targetUserId, userId] }
    });

    if (conversation) {
        for (let i = 0; i < conversation.visible.length; i++) {
            if (conversation.visible[i].userId.toString() === userId.toString()) {
                conversation.visible[i].isVisible = true;
                break;
            }
        }

        await conversation.save();
        await conversation.populate({
            path: "users",
            model: "User",
            select: "-password"
        });

        res.status(200).send({
            data: conversation,
            message: "Conversation already exists."
        });
        return;
    }

    const userFriendsList: IFriendsList | null = await FriendsListM.findOne({
        user: userId
    });

    if (!userFriendsList) {
        res.status(400).json({
            error: "Friends list not found."
        });
        return;
    }

    const friends = (userFriendsList.friendsList as string[]).find((userId: string) => {
        if (userId.toString() === targetUserId.toString()) {
            return userId;
        }
    });

    if (!friends) {
        res.status(400).json({
            error: "You aren't friends with this user."
        });
        return;
    }

    try {
        const newConversation: IConversation = await ConversationM.create({
            users: [userId, targetUserId],
            visible: [
                {
                    userId: userId.toString(),
                    isVisible: true
                },
                {
                    userId: targetUserId.toString(),
                    isVisible: true
                }
            ]
        });

        await newConversation.populate({
            path: "users",
            model: "User",
            select: "-password"
        });

        friendUpdates.updateFriendConversations(targetUserId);

        res.status(201).json({
            data: newConversation,
            message: "Conversation created."
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to create conversation."
        });
    }
}

// PUT
export const hideConversation = async (req: Request, res: Response): Promise<void> => {
    const conversationId: string = req.params.conversationId;

    try {
        const conversation: IConversation | null = await ConversationM.findById(conversationId);
        
        if (!conversation) {
            res.status(400).json({
                error: "Conversation not found."
            });
            return;
        }

        for (let i = 0; i < conversation.visible.length; i++) {
            if (conversation.visible[i].userId.toString() === req.user._id.toString()) {
                conversation.visible[i].isVisible = false;
                break;
            }
        }

        await conversation.save();
        await conversation.populate({
            path: "users",
            model: "User",
            select: "-password"
        });

        res.status(200).json(conversation);
    } catch (error) {
        res.status(400).json({
            error: "Failed to hide conversation."
        });
    }
}