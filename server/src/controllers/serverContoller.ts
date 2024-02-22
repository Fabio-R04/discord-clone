import { Request, Response } from "express";
import ServerM, { IServer, IServerInvitation, IServerMember, ITextChannel, ServerInvitationM, ServerMemberM, TextChannelM } from "../models/serverModel";
import serverStore from "../serverStore";
import ConversationM, { IConversation } from "../models/conversationModel";
import friendUpdates from "../socketHandlers/friendUpdates";
import { Server } from "socket.io";
import MessageM, { IMessage } from "../models/messageModel";
import fs from "fs";
import { promisify } from "util";
import path from "path";

const unlinkAsync = promisify(fs.unlink);

// GET
export const getServers = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user._id;

    try {
        const servers = await ServerMemberM.find({
            user: userId
        }).populate({
            path: "server",
            model: "Server",
        }).sort({ createdAt: -1 });

        res.status(200).json(servers);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch servers"
        });
    }
}

export const getServerDetails = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;

    try {
        const serverDetails: IServer | null = await ServerM.findById(serverId).populate([
            {
                path: "serverOwner",
                model: "User",
                select: "-password"
            },
            {
                path: "textChannels",
                model: "TextChannel"
            }
        ]);

        res.status(200).json(serverDetails);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch server details."
        });
    }
}

export const getServerMembers = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;

    try {
        const members: IServerMember[] = await ServerMemberM.find({
            server: serverId
        }).populate({
            path: "user",
            model: "User",
            select: "-password"
        });

        res.status(200).json(members);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch server members."
        });
    }
}

export const getServerMessages = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;

    try {
        const serverMessages: IMessage[] = await MessageM.find({
            conversation: serverId
        }).populate([
            {
                path: "user",
                model: "User",
                select: "-password"
            },
            {
                path: "serverInvite",
                model: "ServerInvitation",
            },
            {
                path: "textChannel",
                model: "TextChannel"
            }
        ]);

        res.status(200).json(serverMessages);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch server messages."
        });
    }
}

export const isServerMember = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;
    const userId: string = req.user._id;

    try {
        const isMember = await ServerMemberM.exists({
            server: serverId,
            user: userId
        });

        if (isMember) {
            res.status(200).send(true);
        } else {
            res.status(200).send(false);
        }
    } catch (error) {
        res.status(400).json({
            error: "Failed to check if user is a member."
        });
    }
}

// POST
export const createServer = async (req: Request, res: Response): Promise<void> => {
    const { serverName } = req.body;
    const userId: string = req.user._id;

    if (!serverName.trim()) {
        res.status(400).json({
            error: "Server name is required."
        });
    }

    if (req.file) {
        if (req.file.size > 20971520) {
            res.status(400).json({ error: "This file exceeds size limit (20MB)" });
            return;
        }
    }

    try {
        const newServer: IServer = await ServerM.create({
            serverOwner: userId,
            serverName,
            ...(req.file) && {
                serverPicture: {
                    present: true,
                    image: req.file.filename
                }
            }
        });

        const newTextChannel: ITextChannel = await TextChannelM.create({
            server: newServer._id,
            name: "general"
        });

        (newServer.textChannels as string[]).push(newTextChannel._id);
        await newServer.save();

        const newMember = await ServerMemberM.create({
            server: newServer._id,
            user: userId
        });

        await newMember.populate({
            path: "server",
            model: "Server",
        });

        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create server."
        });
    }
}

export const createChannel = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;
    const channelName: string = req.body.channelName;

    if (!channelName.trim()) {
        res.status(400).json({
            error: "Channel name is required."
        });
        return;
    }

    let editedChannel: string = "";
    for (let i = 0; i < channelName.length; i++) {
        if (channelName[i] === " ") {
            editedChannel += "-";
        } else {
            editedChannel += channelName[i];
        }
    }

    try {
        const server: IServer | null = await ServerM.findById(serverId);

        if (!server) {
            res.status(400).json({
                error: "Server not found."
            });
            return;
        }

        const newTextChannel: ITextChannel = await TextChannelM.create({
            server: serverId,
            name: editedChannel
        });

        (server.textChannels as string[]).push(newTextChannel._id);
        await server.save();

        res.status(201).json(newTextChannel);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create new channel."
        });
    }
}

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;
    const targetUserId: string = req.body.targetUserId;
    const userId: string = req.user._id;

    try {
        const conversationExists: IConversation | null = await ConversationM.findOne({
            users: { $all: [targetUserId, userId] }
        });
        let conversation: IConversation;
        let conversationCreated: boolean;

        if (!conversationExists) {
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
            conversation = newConversation;
            conversationCreated = true;

            friendUpdates.updateFriendConversations(targetUserId);
        } else {
            conversation = conversationExists;
            conversationCreated = false;
        }

        const alreadyServerMember = await ServerMemberM.exists({
            server: serverId,
            user: targetUserId
        });

        const newInvitation: IServerInvitation = await ServerInvitationM.create({
            server: serverId,
            status: alreadyServerMember ? "Joined" : "Join",
            targetUser: targetUserId
        });

        const newMessage: IMessage = await MessageM.create({
            conversation: conversation._id,
            user: userId,
            type: "invitation",
            serverInvite: newInvitation._id,
            server: serverId,
            message: ""
        });

        await newMessage.populate([
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

        conversation.updatedAt = new Date();
        await conversation.save();

        const io: Server | null = serverStore.getSocketInstance();
        if (io) {
            io.in(conversation._id.toString()).emit("receive-message", newMessage);
        }

        res.status(201).json({
            conversation,
            conversationCreated
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to invite friend to server."
        });
    }
}

export const joinServer = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;
    const memberId: string = req.params.memberId;

    const serverExists = await ServerM.exists({
        _id: serverId
    });

    if (!serverExists) {
        res.status(400).json({
            error: "This server no longer exists."
        });
        return;
    }

    const alreadyMember = await ServerMemberM.exists({
        server: serverId,
        user: memberId
    });

    if (alreadyMember) {
        res.status(400).json({
            error: "Already in server."
        });
        return;
    }

    try {
        const newMember: IServerMember = await ServerMemberM.create({
            server: serverId,
            user: memberId
        });

        await ServerInvitationM.findOneAndUpdate({
            server: serverId,
            targetUser: memberId
        }, { status: "Joined" });

        await newMember.populate({
            path: "server",
            model: "Server"
        });

        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({
            error: "Failed to join server."
        });
    }
}

// PUT
export const editChannel = async (req: Request, res: Response): Promise<void> => {
    const channelId: string = req.params.channelId;
    const newChannelName: string = req.body.newChannelName;

    if (!newChannelName) {
        res.status(400).json({
            error: "New channel name is required."
        });
        return;
    }

    let editedChannel: string = "";
    for (let i = 0; i < newChannelName.length; i++) {
        if (newChannelName[i] === " ") {
            editedChannel += "-";
        } else {
            editedChannel += newChannelName[i];
        }
    }

    try {
        const channel: ITextChannel | null = await TextChannelM.findById(channelId);

        if (!channel) {
            res.status(400).json({
                error: "Channel not found."
            });
            return;
        }

        channel.name = editedChannel;
        await channel.save();

        res.status(200).json(channel);
    } catch (error) {
        res.status(400).json({
            error: "Failed to edit channel."
        });
    }
}

export const editServer = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;
    const { newServerName, removePicture } = req.body;

    if (removePicture === undefined) {
        res.status(400).json({
            error: "Remove picture status is required."
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
        const server: IServer | null = await ServerM.findById(serverId);

        if (!server) {
            res.status(400).json({
                error: "Server not found."
            });
            return;
        }

        if (JSON.parse(removePicture) && server.serverPicture.present) {
            await unlinkAsync(path.resolve(__dirname, "..", "..", "public", "images", server.serverPicture.image));
            server.serverPicture = {
                present: false,
                image: ""
            }
        } else if (req.file) {
            if (server.serverPicture.present) {
                await unlinkAsync(path.resolve(__dirname, "..", "..", "public", "images", server.serverPicture.image));
            }

            server.serverPicture = {
                present: true,
                image: req.file.filename
            }
        }

        if (newServerName.trim() !== "") {
            server.serverName = newServerName;
        }

        await server.save();
        res.status(200).json({
            serverId: server._id,
            newServerName: server.serverName,
            newServerPicture: server.serverPicture
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to edit server."
        });
    }
}

// DELETE
export const deleteChannel = async (req: Request, res: Response): Promise<void> => {
    const channelId: string = req.params.channelId;

    try {
        const deletedChannel: ITextChannel | null = await TextChannelM.findByIdAndDelete(channelId);

        if (!deletedChannel) {
            res.status(400).json({
                error: "Channel not found."
            });
            return;
        }

        const server: IServer | null = await ServerM.findById(deletedChannel.server);

        if (!server) {
            res.status(400).json({
                error: "Server not found."
            });
            return;
        }

        const updatedChannels: string[] = (server.textChannels as string[]).filter((channelId: string) => {
            if (channelId.toString() !== deletedChannel._id.toString()) {
                return channelId;
            }
        });

        server.textChannels = updatedChannels;
        await server.save();
        await MessageM.deleteMany({ textChannel: channelId });

        res.status(200).json(deletedChannel);
    } catch (error) {
        res.status(400).json({
            error: "Failed to delete channel."
        });
    }
}

export const deleteServer = async (req: Request, res: Response): Promise<void> => {
    const serverId: string = req.params.serverId;
    const userId: string = req.user._id;

    try {
        const server: IServer | null = await ServerM.findById(serverId);

        if (!server) {
            res.status(400).json({
                error: "Server not found."
            });
            return;
        }

        if (userId.toString() !== server.serverOwner.toString()) {
            res.status(400).json({
                error: "You don't have permission to delete this server."
            });
            return;
        }

        await TextChannelM.deleteMany({
            server: server._id
        });

        await MessageM.deleteMany({
            $or: [
                { conversation: serverId },
                { server: serverId }
            ]
        });

        await ServerMemberM.deleteMany({
            server: server._id
        });

        await ServerInvitationM.deleteMany({
            server: server._id
        });

        if (server.serverPicture.present) {
            await unlinkAsync(path.resolve(__dirname, "..", "..", "public", "images", server.serverPicture.image));
        }

        await ServerM.deleteOne({
            _id: serverId
        });

        res.status(200).json(serverId);
    } catch (error) {
        res.status(400).json({
            error: "Failed to delete server."
        });
    }
}