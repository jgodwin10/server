import * as Mongoose from "mongoose";
// import { UserModel } from "./users/users.model";

let database: Mongoose.Connection;

export const connect = () => {
	// add official uri below
	const uri = "mongodb+srv://jacobgodwin281:dSkCjdkOcVqrzJAL@cluster0.nhvui.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
	if (database) {
		return;
	}
	// connect database
	Mongoose.connect(uri).then(() => console.log("Connected"));
};

export const disconnect = () => {
	if (!database) {
		return;
	}
	Mongoose.disconnect();
};
