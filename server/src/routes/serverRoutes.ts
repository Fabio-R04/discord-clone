import express, { Router } from "express";
import multer from "multer";
import path from "path";
const router: Router = express.Router();

import {
    getServers,
    getServerDetails,
    createServer,
    getServerMembers,
    createChannel,
    inviteMember,
    joinServer,
    isServerMember,
    getServerMessages,
    editChannel,
    deleteChannel,
    editServer,
    deleteServer
} from "../controllers/serverContoller";
import { authenticateToken } from "../middleware/authMiddleware";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "..", "..", "public", "images"));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
export const upload = multer({ storage });

// GET
router.get("/servers", authenticateToken, getServers);
router.get("/details/:serverId", authenticateToken, getServerDetails);
router.get("/members/:serverId", authenticateToken, getServerMembers);
router.get("/messages/:serverId", authenticateToken, getServerMessages);
router.get("/check-member/:serverId", authenticateToken, isServerMember);

// POST
router.post("/create", authenticateToken, upload.single("file"), createServer);
router.post("/new-channel/:serverId", authenticateToken, createChannel);
router.post("/invite-member/:serverId", authenticateToken, inviteMember);
router.post("/join-server/:serverId/:memberId", authenticateToken, joinServer);

// PUT
router.put("/edit-channel/:channelId", authenticateToken, editChannel);
router.put("/edit-server/:serverId", upload.single("file"), authenticateToken, editServer);

// DELETE
router.delete("/text-channel/:channelId", authenticateToken, deleteChannel);
router.delete("/delete-server/:serverId", authenticateToken, deleteServer);

export default router;