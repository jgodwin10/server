import express from "express";
import protect from "@/middleware/authMiddleWare";
import { createPost, getRankedTweets, trainModelEndpoint, PostLike, getMyPosts, PostDisLike, PostShares, getLikes } from "@/Controllers/postController";

const router = express.Router();

//ROUTES

//@POST
router.post("/create", protect, createPost);
router.post("/like/:id", protect, PostLike as any);
router.post("/dislike/:id", protect, PostDisLike as any);
router.post("/share/:id", protect, PostShares as any);

//@GET
router.get("/get", protect, getMyPosts as any);
router.get("/like/:id", protect, getLikes);
router.get("/get_ranked", protect, getRankedTweets as any);
// router.get("/get_recommend", protect, recommendTweetsEndpoint as any);
router.get("/train", trainModelEndpoint);

export default router;
