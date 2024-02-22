import express, { Router } from "express";
const router: Router = express.Router();

import {
    getMessages
} from "../controllers/messageController";
import { authenticateToken } from "../middleware/authMiddleware";

// GET
router.get("/messages/:conversationId", authenticateToken, getMessages);

export default router;