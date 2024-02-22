import { Server } from "socket.io";
import FriendRequestM, { FriendRequest, FriendsListM, IFriendsList } from "../models/friendModel";
import ConversationM, { IConversation } from "../models/conversationModel";
import serverStore, { OnlineUser } from "../serverStore";

class FriendUpdates {
    public constructor() { }

    public async updatePendingFriendRequests(receiverId: string): Promise<void> {
        const pendingFriendRequests: FriendRequest[] = await FriendRequestM.find({
            $or: [{ receiver: receiverId }, { sender: receiverId }]
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
        const io: Server | null = serverStore.getSocketInstance();
        const onlineUsers: Record<string, string> = serverStore.getOnlineUsers();

        if (io) {
            for (const [key, value] of Object.entries(onlineUsers)) {
                if (key.toString() === receiverId.toString()) {
                    io.to(value).emit("update-pending", (pendingFriendRequests || []));
                }
            }
        }
    }

    public async updateUserFriendsList(targetUserId: string): Promise<void> {
        const friendsList: IFriendsList | null = await FriendsListM.findOne({
            user: targetUserId
        }).populate({
            path: "friendsList",
            model: "User",
            select: "-password"
        });

        if (!friendsList) {
            return;
        }

        const io: Server | null = serverStore.getSocketInstance();
        const onlineUsers: Record<string, string> = serverStore.getOnlineUsers();

        if (io) {
            for (const [key, value] of Object.entries(onlineUsers)) {
                if (key.toString() === targetUserId.toString()) {
                    io.to(value).emit("update-friend-list", friendsList);
                }
            }
        }
    }

    public async updateFriendConversations(targetUserId: string): Promise<void> {
        const conversations: IConversation[] = await ConversationM.find({
            users: { $in: [targetUserId] }
        }).populate({
            path: "users",
            model: "User",
            select: "-password"
        }).sort({ updatedAt: -1 });

        const io: Server | null = serverStore.getSocketInstance();
        const onlineUsers: Record<string, string> = serverStore.getOnlineUsers();

        if (io) {
            for (const [key, value] of Object.entries(onlineUsers)) {
                if (key.toString() === targetUserId.toString()) {
                    io.to(value).emit("update-conversations", (conversations || []));
                }
            }
        }
    }
}

const friendUpdates: FriendUpdates = new FriendUpdates();
export default friendUpdates;