import React, { useContext, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { getConversations } from "../features/conversation/conversationSlice";
import { IMessage } from "../features/message/messageInterfaces";
import { appendMessage } from "../features/message/messageSlice";

// Constants
const serverURL: string = `${process.env.REACT_APP_SERVER_URL}`;

// Context
export const SocketContext = React.createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (user) {
            const newSocket = io(serverURL, {
                auth: {
                    token: user.token
                }
            });
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            }
        }
    }, [user]);

    useEffect(() => {
        if (socket) {
            socket.off("error-handler").on("error-handler", (error: string): void => {
                toast.error(error);
            });

            socket.off("receive-message").on("receive-message", (message: IMessage): void => {
                dispatch(getConversations());
                dispatch(appendMessage(message));
            });
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}