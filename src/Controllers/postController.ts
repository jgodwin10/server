import { uploadToCloudinary } from "@/database/Cloudinary";
import { PostModel } from "@/models/Posts/posts.models";
import { UserModel } from "@/models/Users/users.models";
import fs from "fs";
import * as tf from "@tensorflow/tfjs-node";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import { loadModel, prepareData, rankTweets, saveModel, trainModel } from "@/services/TensorFlow";

let trainedModel: tf.LayersModel | null = null;

// Cache for recently recommended tweets
const recentlyRecommended: { [userId: string]: string[] } = {};

// Initialize the model by loading it from the filesystem if available
(async () => {
	trainedModel = await loadModel();
})();

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
	const files = req.files as any;
	const user = req.user;
	const { text } = req.body;

	let post: any;
	let file: any;
	let image;

	if (files) {
		file = files[0];
	}

	try {
		const data = { post: user.post + 1 };

		if (!user) {
			return next(new Error("No user"));
		}

		if (file) {
			const { path } = file;
			const newPath = await uploadToCloudinary(path, "Appmosphere");

			const dataImage = newPath?.url.replace("http://", "https://");

			image = {
				url: dataImage,
				public_id: newPath?.public_id,
			};
			fs.unlinkSync(path);

			post = await PostModel.create({ user: user, text, images: image });

			await UserModel.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true });
		} else {
			if (!text) {
				return next(new Error("Error"));
			}
			post = await PostModel.create({ user: user, text });

			await UserModel.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true });
		}

		res.status(201).json({ message: "Post made successfully", post });
	} catch (err) {
		console.log(err);
		next(err);
	}
};

export const PostLike = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	const userId = user._id;
	const { id } = req.params;

	try {
		const post = await PostModel.findOne({ _id: id });

		if (post?.dislikes?.includes(user._id)) {
			if (post?.likes?.includes(user._id)) {
				const postLike = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { likes: userId, dislikes: userId } }, { new: true });

				return res.status(200).json({ message: "Post liked", postLike });
			} else {
				const postLike = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { dislikes: userId }, $push: { likes: user } }, { new: true });

				return res.status(200).json({ message: "Post disliked", postLike });
			}
		} else {
			if (post?.likes?.includes(user._id)) {
				const postLike = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { likes: userId } }, { new: true });

				return res.status(200).json({ message: "Post liked", postLike });
			} else {
				const postLike = await PostModel.findOneAndUpdate({ _id: id }, { $push: { likes: user } }, { new: true });

				res.status(200).json({ message: "Post liked", postLike });
			}
		}
	} catch (err) {
		next(err);
	}
};

export const PostDisLike = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	const userId = user._id;
	const { id } = req.params;

	try {
		const post = await PostModel.findOne({ _id: id });

		if (post?.likes?.includes(user._id)) {
			if (post?.dislikes?.includes(user._id)) {
				const postDisLike = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { dislikes: userId, likes: userId } }, { new: true });

				return res.status(200).json({ message: "Post disliked", postDisLike });
			} else {
				const postDisLike = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { likes: userId }, $push: { dislikes: user } }, { new: true });

				return res.status(200).json({ message: "Post disliked", postDisLike });
			}
		} else {
			if (post?.dislikes?.includes(user._id)) {
				const postDisLike = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { dislikes: userId } }, { new: true });

				return res.status(200).json({ message: "Post disliked", postDisLike });
			} else {
				const postDisLike = await PostModel.findOneAndUpdate({ _id: id }, { $push: { dislikes: user } }, { new: true });

				return res.status(200).json({ message: "Post disliked", postDisLike });
			}
		}
	} catch (err) {
		next(err);
	}
};

export const PostShares = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	const userId = user._id;
	const { id } = req.params;

	try {
		const post = await PostModel.findOne({ _id: id });

		if (post?.shares?.includes(user._id)) {
			const postShare = await PostModel.findOneAndUpdate({ _id: id }, { $pull: { shares: userId } }, { new: true });

			return res.status(200).json(postShare);
		}

		const postShare = await PostModel.findOneAndUpdate({ _id: id }, { $push: { shares: user } }, { new: true });

		res.status(200).json(postShare);
	} catch (err) {
		next(err);
	}
};

export const getMyPosts = async (req: Request, res: Response) => {
	const user = req.user;
	const userId = user._id;

	try {
		if (!trainedModel) {
			const tweets = await PostModel.find({ user: userId }).populate("user", { password: 0 }).sort("asc");
			const { features, labels } = await prepareData(tweets);
			trainedModel = await trainModel(features, labels);
			// Save the trained model
			await saveModel(trainedModel);

			const rankedTweets = await rankTweets(trainedModel, tweets);
			return res.status(200).json(rankedTweets);

			// return res.status(400).json({ message: "Model is not trained. Train the model first." });
		}

		const tweets = await PostModel.find({ user: userId }).populate("user", { password: 0 }).sort("asc");

		const rankedTweets = await rankTweets(trainedModel, tweets);
		return res.status(200).json(rankedTweets);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
};

export const getRankedTweets = async (req: Request, res: Response) => {
	try {
		if (!trainedModel) {
			const tweets = await PostModel.find().populate("user", { password: 0 }).sort("asc");
			const { features, labels } = await prepareData(tweets);
			trainedModel = await trainModel(features, labels);
			// Save the trained model
			await saveModel(trainedModel);

			const rankedTweets = await rankTweets(trainedModel, tweets);
			return res.status(200).json(rankedTweets);

			// return res.status(400).json({ message: "Model is not trained. Train the model first." });
		}

		const tweets = await PostModel.find().populate("user", { password: 0 }).sort("asc");
		const rankedTweets = await rankTweets(trainedModel, tweets);
		res.status(200).json(rankedTweets);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
};

export const getLikes = async (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.params;

	try {
		const post = await PostModel.findById(id).populate("likes", { fullName: 1, username: 1, image: 1 });

		res.status(200).json(post);
	} catch (err) {
		next(err);
	}
};

// export const recommendTweetsEndpoint = async (req: Request, res: Response) => {
// 	try {
// 		const user = req.user;

// 		const userId = user._id;
// 		// Fetch user's followers and all tweets

// 		const tweets = await PostModel.find({});

// 		const follower = user?.followers?.map((follower: any) => follower.toString());
// 		const following = user?.followings?.map((follow: any) => follow.toString());

// 		const uniqueSet = [...new Set([...follower, ...following])];

// 		// Get recently recommended tweets for this user
// 		const excludedTweets = recentlyRecommended[userId] || [];

// 		// Generate recommendations
// 		const recommendedPosts = await recommendPosts(trainedModel, tweets, {
// 			followers: user.followers,
// 			userId,
// 			exclude: excludedTweets,
// 		});

// 		// Update cache with the IDs of recommended tweets
// 		recentlyRecommended[userId] = recommendedPosts.map((tweet) => tweet._id).slice(0, 10); // Keep only the latest 10

// 		res.status(200).json(recommendedPosts);
// 	} catch (err: any) {
// 		res.status(500).json({ message: err.message });
// 	}
// };

export const trainModelEndpoint = async (req: Request, res: Response) => {
	try {
		const tweets = await PostModel.find().populate("user", { password: 0 }).sort("asc");

		const { features, labels } = await prepareData(tweets);

		trainedModel = await trainModel(features, labels);

		// Save the trained model
		await saveModel(trainedModel);

		res.status(200).json({ message: "Model trained and saved successfully." });
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
};
