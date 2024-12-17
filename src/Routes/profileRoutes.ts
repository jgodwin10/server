import express from "express";
import protect from "@/middleware/authMiddleWare";
import { updateProfile, userProfile } from "@/Controllers/profileController";

const router = express.Router();

router.post("/update_profile", protect, updateProfile);
router.get("/profile", protect, userProfile);

export default router;
