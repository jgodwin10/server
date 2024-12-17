import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import { IPost } from "@/models/Posts/posts.types";

const MODEL_DIR = "./models"; // Directory to save/load the model

// Normalize recency (e.g., in hours)
const normalizeRecency = (timestamp: Date): number => {
	const now = new Date();
	return (now.getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60); // Convert to hours
};

// Prepare features and labels for training
export const prepareData = async (tweets: IPost[]) => {
	const features: number[][] = [];
	const labels: number[] = [];

	tweets.forEach((tweet) => {
		const contentLength = tweet.text.length;
		const hashtagsCount = tweet?.shares?.length;
		const recency = normalizeRecency(tweet.createdAt);

		// Features: [contentLength, likes, retweets, recency, hashtagsCount]
		features.push([contentLength, tweet?.likes?.length, tweet.comments, recency, hashtagsCount]);

		// Engagement Score
		const engagementScore = tweet?.likes?.length * 0.5 + tweet.comments * 0.3;
		labels.push(engagementScore);
	});

	return {
		features: tf.tensor2d(features),
		labels: tf.tensor2d(labels, [labels?.length, 1]),
	};
};

// Build and train the model
export const trainModel = async (features: tf.Tensor, labels: tf.Tensor) => {
	const model = tf.sequential();
	model.add(tf.layers.dense({ inputShape: [5], units: 10, activation: "relu" }));
	model.add(tf.layers.dense({ units: 5, activation: "relu" }));
	model.add(tf.layers.dense({ units: 1, activation: "linear" }));

	model.compile({ optimizer: "adam", loss: "meanSquaredError" });

	console.log("Training the model...");
	await model.fit(features, labels, { epochs: 100, batchSize: 32 });
	console.log("Training complete.");

	return model;
};

// Predict and rank tweets
export const rankTweets = async (model: tf.LayersModel, tweets: IPost[]) => {
	const predictions: { tweet: IPost; engagementScore: number | undefined }[] = [];

	tweets.forEach((tweet) => {
		const contentLength = tweet?.text?.length;
		const hashtagsCount = tweet?.shares?.length;
		const recency = normalizeRecency(tweet.createdAt);

		const featureTensor = tf.tensor2d([[contentLength, tweet?.likes?.length, tweet.comments, recency, hashtagsCount]]);
		const prediction = model.predict(featureTensor) as tf.Tensor;
		const engagementScore = prediction.dataSync()[0];
		predictions.push({ tweet, engagementScore });
	});

	return predictions.sort((a, b) => b.engagementScore! - a.engagementScore!);
};

// Save the model to the filesystem
export const saveModel = async (model: tf.LayersModel): Promise<void> => {
	if (!fs.existsSync(MODEL_DIR)) {
		fs.mkdirSync(MODEL_DIR, { recursive: true });
	}
	await model.save(`file://${MODEL_DIR}`);
	console.log("Model saved successfully.");
};

// Load the model from the filesystem
export const loadModel = async (): Promise<tf.LayersModel | null> => {
	if (fs.existsSync(`${MODEL_DIR}/model.json`)) {
		console.log("Loading existing model...");
		return await tf.loadLayersModel(`file://${MODEL_DIR}/model.json`);
	}
	console.log("No pre-trained model found. Training required.");
	return null;
};

// Prepare input features for the TensorFlow model
const prepareFeatures = (posts: IPost[]) => {
	return posts.map((post) => [
		post.likes, // Number of likes
		post.comments, // Number of retweets
		post.shares.length, // Number of hashtags
		post.text.length, // Length of the content
	]);
};

// // Score posts using the TensorFlow model, prioritize followers
// const scorePosts = (model: tf.LayersModel | null, posts: IPost[], isFollower: boolean) => {
// 	if (!model) {
// 		// Default scoring logic if the model is unavailable
// 		return posts.map((post) => ({
// 			post,
// 			score:
// 				post.likes.length * 0.5 +
// 				post.comments * 0.3 +
// 				post.shares.length * 0.2 +
// 				(isFollower ? 1.5 : 0) + // Bonus for being a follower's post
// 				Math.random() * 0.1, // Add small random factor for variability
// 		}));
// 	}

// 	// Use TensorFlow model for scoring
// 	const features = prepareFeatures(posts);
// 	const tensor = tf.tensor2d(features);
// 	const predictions = model.predict(tensor) as tf.Tensor;

// 	const scores = Array.from(predictions.dataSync());

// 	if (scores) {
// 		return posts.map((post, index) => ({
// 			post,
// 			score: scores[index] + (isFollower ? 1.5 : 0) + Math.random() * 0.1,
// 		}));
// 	}
// };

// // Shuffle array randomly
// const shuffleArray = <T>(array: T[]): T[] => {
// 	for (let i = array.length - 1; i > 0; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		[array[i], array[j]] = [array[j], array[i]];
// 	}
// 	return array;
// };

// export const recommendPosts = async (model: tf.LayersModel | null, tweets: IPost[], config: { followers: string[]; userId: string; exclude?: string[] }) => {
// 	const { followers, exclude = [] } = config;

// 	console.log(followers);

// 	// Separate tweets into followers' and non-followers' posts
// 	const followersPosts = tweets.filter((tweet) => followers.includes(tweet?.user!) && !exclude.includes(tweet?._id));
// 	const nonFollowersPosts = tweets.filter((tweet) => !followers.includes(tweet.user) && !exclude.includes(tweet?._id));

// 	// console.log(followersPosts)

// 	// Score posts with relevance and trending logic
// 	const scoredFollowersPosts = scorePosts(model, followersPosts, true);
// 	const scoredNonFollowersPosts = scorePosts(model, nonFollowersPosts, false);

// 	console.log(scoredFollowersPosts, scoredNonFollowersPosts)

// 	// Sort by score (descending) and shuffle ties
// 	const sortedFollowersPosts = shuffleArray(scoredFollowersPosts.sort((a, b) => b.score - a.score));
// 	const sortedNonFollowersPosts = shuffleArray(scoredNonFollowersPosts.sort((a, b) => b.score - a.score));

// 	// Merge results with followers-first prioritization
// 	return [...sortedFollowersPosts, ...sortedNonFollowersPosts].map(({ post }) => post);
// };
