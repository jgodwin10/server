import express from "express";
import protect from "@/middleware/authMiddleWare";
import { AllUsers, Follow, Followers, Friends } from "@/Controllers/FriendsController";

const router = express.Router();

router.post("/follow", protect, Follow as any);
router.get("/", protect, Friends as any);
router.get("/followers", protect, Followers as any);
router.get("/users", protect, AllUsers as any);

export default router;
