import express, { Router } from "express";
const router: Router = express.Router();

import {
    sendFriendRequest,
    getPendingFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getAllFriends,
    removeFriend
} from "../controllers/friendController";
import { authenticateToken } from "../middleware/authMiddleware";

// GET
router.get("/pending-requests", authenticateToken, getPendingFriendRequests);
router.get("/all", authenticateToken, getAllFriends);

// POST
router.post("/send-request/:targetUsername", authenticateToken, sendFriendRequest);
router.post("/accept-request/:senderId", authenticateToken, acceptFriendRequest);
router.post("/reject-request/:requestId", authenticateToken, rejectFriendRequest);
router.post("/remove/:targetId", authenticateToken, removeFriend);

export default router;