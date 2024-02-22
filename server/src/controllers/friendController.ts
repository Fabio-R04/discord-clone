import { Request, Response } from "express";
import FriendRequestM, { FriendRequest, FriendsListM, IFriendsList } from "../models/friendModel";
import UserM, { IUser } from "../models/authModel";
import friendUpdates from "../socketHandlers/friendUpdates";

// GET 
export const getPendingFriendRequests = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user._id;

    try {
        const pendingFriendRequests: FriendRequest[] = await FriendRequestM.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).populate([
            {
                path: "sender",
                model: "User",
                select: "-password"
            },
            {
                path: "receiver",
                model: "User",
                select: "-password"
            }
        ]).sort({ createdAt: -1 });
        res.status(200).json(pendingFriendRequests);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch pending friend requests."
        });
    }
}

export const getAllFriends = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user._id;

    try {
        const allFriends = await FriendsListM.findOne({
            user: userId
        }).populate({
            path: "friendsList",
            model: "User",
            select: "-password"
        });

        res.status(200).json(allFriends);
    } catch (error) {
        res.status(400).json({
            error: "Failed to fetch all friends."
        });
    }
}

// POST
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
    const targetUsername: string = req.params.targetUsername;
    const sender: IUser = req.user;

    if (targetUsername.toLowerCase() === sender.username.toLowerCase()) {
        res.status(400).json({
            error: "Can't send a friend request to yourself."
        });
        return;
    }

    const targetUser: IUser | null = await UserM.findOne({
        username: targetUsername
    });

    if (!targetUser) {
        res.status(400).json({
            error: `'${targetUsername}' doesn't exist.`
        });
        return;
    }

    const alreadySentFriendRequest = await FriendRequestM.exists({
        receiverId: targetUser._id,
        senderId: sender._id
    })

    if (alreadySentFriendRequest) {
        res.status(400).json({
            error: `Already sent friend request to '${targetUsername}'.`
        });
        return;
    }

    const alreadyFriends = await FriendsListM.exists({
        user: targetUser._id,
        friendsList: {
            $elemMatch: {
                $eq: sender._id
            }
        }
    });

    if (alreadyFriends) {
        res.status(400).json({
            error: `Already friends with '${targetUsername}'.`
        });
        return;
    }

    try {
        const newFriendRequest: FriendRequest = await FriendRequestM.create({
            receiver: targetUser._id,
            sender: sender._id
        })

        await newFriendRequest.populate([
            {
                path: "sender",
                model: "User",
                select: "-password"
            },
            {
                path: "receiver",
                model: "User",
                select: "-password"
            }
        ]);

        friendUpdates.updatePendingFriendRequests(targetUser._id);

        res.status(201).json({
            success: "Friend request sent!",
            outgoingRequest: newFriendRequest
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to send friend request."
        });
    }
}

export const acceptFriendRequest = async (req: Request, res: Response): Promise<void> => {
    const senderId: string = req.params.senderId;
    const userId: string = req.user._id;

    try {
        const friendRequest: FriendRequest | null = await FriendRequestM.findOneAndDelete({
            sender: senderId,
            receiver: userId
        });

        if (!friendRequest) {
            res.status(400).json({
                error: "Friend request not found."
            });
            return;
        }

        const senderList: IFriendsList | null = await FriendsListM.findOne({
            user: senderId
        });

        const userList: IFriendsList | null = await FriendsListM.findOne({
            user: userId
        });

        if (!senderList || !userList) {
            res.status(400).json({
                error: "Friends list is missing."
            });
            return;
        }

        (senderList.friendsList as string[]).push(userId);
        (userList.friendsList as string[]).push(senderId);

        await senderList.save();
        await userList.save();

        friendUpdates.updatePendingFriendRequests(senderId);
        friendUpdates.updateUserFriendsList(senderId);
        res.status(200).json({
            friendRequestId: friendRequest._id
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to accept friend request."
        });
    }
}

export const rejectFriendRequest = async (req: Request, res: Response): Promise<void> => {
    const requestId: string = req.params.requestId;
    const { senderId, receiverId } = req.body;
    const userId: string = req.user._id;

    if (!senderId || !receiverId) {
        res.status(400).json({
            error: "Sender or Receiver ID not found."
        });
        return;
    }

    try {
        const friendRequest: FriendRequest | null = await FriendRequestM.findByIdAndDelete(requestId);
        if (friendRequest) {
            friendUpdates.updatePendingFriendRequests(senderId === userId.toString() ? receiverId : senderId);
            res.status(200).json({
                friendRequestId: friendRequest._id
            });
        }
    } catch (error) {
        res.status(400).json({
            error: "Failed to delete friend request."
        });
    }
}

export const removeFriend = async (req: Request, res: Response): Promise<void> => {
    const targetId: string = req.params.targetId;
    const userId: string = req.user._id;

    try {
        const userFriendsList: IFriendsList | null = await FriendsListM.findOne({
            user: userId
        });
        const targetUserFriendsList: IFriendsList | null = await FriendsListM.findOne({
            user: targetId
        });

        if (userFriendsList && targetUserFriendsList) {
            const updatedFriendsListUser: string[] = (userFriendsList.friendsList as string[]).filter((userId: string) => {
                if (userId.toString() !== targetId.toString()) {
                    return userId;
                }
            });
            
            const updatedFriendsListTargetUser: string[] = (targetUserFriendsList.friendsList as string[]).filter((userId: string) => {
                if (userId.toString() !== userId.toString()) {
                    return userId;
                }
            });

            userFriendsList.friendsList = updatedFriendsListUser;
            targetUserFriendsList.friendsList = updatedFriendsListTargetUser;

            await userFriendsList.save();
            await targetUserFriendsList.save();

            await userFriendsList.populate({
                path: "friendsList",
                model: "User",
                select: "-password"
            });

            friendUpdates.updateUserFriendsList(targetId);
            res.status(200).json(userFriendsList);
        }
    } catch (error) {
        res.status(400).json({
            error: "Failed to remove friend."
        });
    }
}