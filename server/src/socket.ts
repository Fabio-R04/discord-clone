import { Server, Socket } from "socket.io";
import { verifyTokenSocket, CustomSocket } from "./middleware/authMiddleware";
import serverStore, { OnlineUser } from "./serverStore";
import http from "http";
import MessageM, { IMessage } from "./models/messageModel";
import ConversationM from "./models/conversationModel";
import ServerM, { ServerInvitationM } from "./models/serverModel";

export const initializeSocketServer = (server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
    console.log("Initilazing socket server...");
    const io = new Server(server, {
        cors: {
            origin: `${process.env.CLIENT_URL}`
        }
    });
    serverStore.setSocketInstance(io);

    io.use((socket: Socket, next: any): void => {
        verifyTokenSocket(socket, next);
    });

    const emitActiveUsers = (): void => {
        const activeUsers: Record<string, string> = serverStore.getOnlineUsers();
        io.emit("active-users", activeUsers);
    }

    io.on("connection", (socket: CustomSocket): void => {
        console.log(`User: ${socket.userId}, connected!`);
        serverStore.addConnectedUser(socket.id, socket.userId!);

        emitActiveUsers();

        socket.on("join-room", (conversationId: string): void => {
            console.log("User joined conversation:", conversationId);
            socket.join(conversationId);
        });

        socket.on("new-message", async (data: {
            conversationId: string;
            userId: string;
            message: string;
            from: string;
            textChannel?: string;
        }): Promise<void> => {
            let conversation;
            if (data.from === "conversation") {
                conversation = await ConversationM.findById(data.conversationId);
            } else if (data.from === "server") {
                conversation = await ServerM.findById(data.conversationId);
            }

            if (conversation) {
                const newMessage: IMessage = await MessageM.create({
                    conversation: data.conversationId,
                    user: data.userId,
                    type: "message",
                    message: data.message,
                    ...(data.from === "server") && { textChannel: data.textChannel }
                });

                await newMessage.populate([
                    {
                        path: "user",
                        model: "User",
                        select: "-password"
                    },
                    {
                        path: "textChannel",
                        model: "TextChannel"
                    }
                ]);

                if (data.from === "conversation") {
                    conversation.updatedAt = new Date();
                    await conversation.save();
                }

                if (data.from === "conversation") {
                    io.in(data.conversationId).emit("receive-message", newMessage);
                } else if (data.from === "server") {
                    io.in(data.conversationId).emit("receive-server-message", newMessage);
                }

            }
        });

        socket.on("delete-message", async (data: {
            messageId: string;
            from: string;
        }): Promise<void> => {
            const { messageId, from } = data;
            const message: IMessage | null = await MessageM.findByIdAndDelete(messageId);

            if (!message) {
                socket.emit("error-handler", "Message not found.");
                return;
            }

            if (message.type === "invitation") {
                await ServerInvitationM.deleteOne({
                    _id: message.serverInvite
                });
            }

            if (from === "conversation") {
                io.in(message.conversation.toString()).emit("delete-message-payload", message);
            } else if (from === "server") {
                io.in(message.conversation.toString()).emit("delete-server-message-payload", message);
            }
        });

        socket.on("disconnect", (): void => {
            console.log(`User: ${socket.userId}, disconnected.`);
            serverStore.removeConnectedUser(socket.id);
        });
    });

    setInterval(() => {
        emitActiveUsers();
    }, 8000)
}