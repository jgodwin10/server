import { Schema } from "mongoose";
import { UserModel } from "../Users/users.models";

const PostSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: UserModel.modelName,
			required: [true, "Please provide user"],
		},
		text: {
			type: String,
		},
		images: {
			type: [Object],
		},
		videos: {
			type: String,
		},
		likes: {
			type: [Schema.Types.ObjectId],
			ref: UserModel.modelName,
			default: [],
		},
		dislikes: {
			type: [Schema.Types.ObjectId],
			ref: UserModel.modelName,
			default: [],
		},
		shares: {
			type: [Schema.Types.ObjectId],
			ref: UserModel.modelName,
			default: [],
		},
		comments: {
			type: Number,
			default: 0,
		},
		created_At: {
			type: Date,
			default: Date.now(),
		},
	},
	{ timestamps: true }
);

export default PostSchema;
