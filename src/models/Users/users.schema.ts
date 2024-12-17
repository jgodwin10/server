import { Schema } from "mongoose";

const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		image: {
			type: Object,
		},
		fullName: {
			type: String,
		},
		bio: {
			type: String,
		},
		post: {
			type: Number,
			default: 0,
		},
		followers: {
			type: [Schema.Types.ObjectId],
			default: [],
			ref: "user",
		},
		followings: {
			type: [Schema.Types.ObjectId],
			default: [],
			ref: "user",
		},
		hobbies: {
			type: [String],
		},
		dob: {
			type: Date,
		},
		location: {
			type: String,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		email_verified: {
			type: Boolean,
			default: false,
		},
		joined_date: {
			type: Date,
			default: Date.now(),
		},
	},
	{ timestamps: true }
);

export default UserSchema;
