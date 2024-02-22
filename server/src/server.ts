import { config } from "dotenv";
config();
import express, { Application } from "express";
import http from "http";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import { initializeSocketServer } from "./socket";
// Import Routes
import authRoutes from "./routes/authRoutes";
import friendRoutes from "./routes/friendRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import messageRoutes from "./routes/messageRoutes";
import serverRoutes from "./routes/serverRoutes";

const app: Application = express();
const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> = http.createServer(app);
initializeSocketServer(server);
const clientURL: string = `${process.env.CLIENT_URL}`;
const corsOptions: CorsOptions = {
    origin: clientURL,
    credentials: true
}

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors(corsOptions));

// Routes Middleware
app.use("/auth", authRoutes);
app.use("/friend", friendRoutes);
app.use("/conversation", conversationRoutes);
app.use("/message", messageRoutes);
app.use("/server", serverRoutes);

// Database Connection
const port: number = Number(process.env.PORT);
const uri: string = `${process.env.MONGO_URI}`;

(async () => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected");
        server.listen(port, () => {
            console.log(`Server listening on port: ${port}`);
        });
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();