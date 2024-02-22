import express, { Router } from "express";
const router: Router = express.Router();

import {
    register,
    login,
    editProfile
} from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";
import { upload } from "./serverRoutes";

// POST
router.post("/register", register);
router.post("/login", login);

// PUT
router.put("/edit-profile", upload.single("file"), authenticateToken, editProfile);

export default router;