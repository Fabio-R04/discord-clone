import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserM, { IUser } from "../models/authModel";
import { Socket } from "socket.io";

interface CustomRequest extends Request {
    user: any;
}

export interface CustomSocket extends Socket {
    userId?: string;
}

export const authenticateToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader: string | undefined = req.headers.authorization;
    const token: string | null = authHeader ? authHeader.split(" ")[1] : null;

    if (!token) {
        res.status(403).json({
            error: "Not Authorized"
        });
        return;
    }

    try {
        const { id } = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;
        req.user = await UserM.findById(id).select("-password");
        next();
    } catch (error) {
        res.status(403).json({
            error: "Not Authorized"
        });
    }
}

export const verifyTokenSocket = (socket: CustomSocket, next: NextFunction): void => {
    const token: string | null = socket.handshake.auth.token;

    if (!token) {
        next(new Error("Not Authorized"));
        return;
    }

    try {
        const { id } = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;
        socket.userId = id;
        next();
    } catch (error) {
        next(new Error("Not Authorized"));
    }
}