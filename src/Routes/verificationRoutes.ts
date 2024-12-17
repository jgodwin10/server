// this is the auth route and provides the auth controllers
import express from "express";
const router = express.Router();

import protect from "@/middleware/authMiddleWare";
import {
	createVerification,
	VerifyEmailCode,
} from "@/Controllers/EmailController";

/**
 * @openapi
 * /verify:
 *   post:
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successful login
 */
router.post("/verify", protect, VerifyEmailCode as any);
router.post("/send_code", protect, createVerification as any);

export default router;
