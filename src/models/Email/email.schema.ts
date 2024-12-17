import { Schema } from "mongoose";

const EmailSchema = new Schema(
	{
		email: {
			type: String,
		},
		otp: {
			type: String,
		},
		// created_date: {
		// 	type: Date,
		// 	default: new Date(),
		// },
	},
	{ timestamps: true }
);

export default EmailSchema;
