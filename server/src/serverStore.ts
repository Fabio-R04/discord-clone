import { Server } from "socket.io";

export interface OnlineUser {
    userId: string;
    socketId: string;
}

class ServerStore {
    private users: Record<string, string>;
    private socketInstance: Server | null;

    public constructor(ioInstance?: Server) {
        this.users = {};
        this.socketInstance = (ioInstance === undefined) ? null : ioInstance;
    }

    public addConnectedUser(socketId: string, userId: string): void {
        this.users[socketId] = userId;
    }

    public removeConnectedUser(socketId: string): string {
        const user: string = this.users[socketId];
        delete this.users[socketId];
        return user;
    }

    public getOnlineUsers(): Record<string, string> {
        const onlineUsersHash: Record<string, string> = {};
        for (const [key, value] of Object.entries(this.users)) {
            onlineUsersHash[value] = key;
        }
        return onlineUsersHash;
    }

    public getSocketInstance(): Server | null {
        return this.socketInstance;
    }

    public setSocketInstance(ioInstance: Server): void {
        this.socketInstance = ioInstance;
    }
}

const serverStore: ServerStore = new ServerStore();
export default serverStore;