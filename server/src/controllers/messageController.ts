import { Request, Response } from "express";
import MessageM, { IMessage } from "../models/messageModel";
import ConversationM, { IConversation } from "../models/conversationModel";

// GET
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    const conversationId: string = req.params.conversationId;

    try {
        const messages: IMessage[] = await MessageM.find({
            conversation: conversationId
        }).populate([
            {
                path: "user",
                model: "User",
                select: "-password"
            },
            {
                path: "serverInvite",
                model: "ServerInvitation",
                populate: {
                    path: "server",
                    model: "Server"
                }
            }
        ]);

        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch messages."
        });
    }
}