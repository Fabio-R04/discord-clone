import express, { Router } from "express";
const router: Router = express.Router();

import {
    createConversation,
    getConversations,
    hideConversation,
    getConversationDetails
} from "../controllers/conversationController";
import { authenticateToken } from "../middleware/authMiddleware";

// GET
router.get("/conversations", authenticateToken, getConversations);
router.get("/details/:conversationId", authenticateToken, getConversationDetails);

// POST
router.post("/create/:targetUserId", authenticateToken, createConversation);

// PUT
router.put("/hide-direct/:conversationId", authenticateToken, hideConversation);

export default router;