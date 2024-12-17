import { Schema } from "mongoose";

const FriendSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Please provide user"],
		},
		friendId: {
			type: Schema.Types.ObjectId,
		},
	},
	{ timestamps: true }
);

export default FriendSchema;
