import { uploadToCloudinary } from "@/database/Cloudinary";
import { UserModel } from "@/models/Users/users.models";
import { NextFunction, Request, Response } from "express";
import fs from "fs";

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
	const { fullName, email, hobbies, dob, bio, location, username } = req.body;
	const user = req.user;
	const files = req.files as any;

	let file: any;
	let image;

	if (files) {
		file = files[0];
	}

	const hobbyArray = hobbies?.trim().split(",");

	try {
		if (file) {
			const { path } = file;
			const newPath = await uploadToCloudinary(path, "Appmosphere");

			const dataImage = newPath?.url.replace("http://", "https://");

			image = {
				url: dataImage,
				public_id: newPath?.public_id,
			};
			fs.unlinkSync(path);
		}

		const data = {
			username: username ? username : user.username,
			fullName: fullName ? fullName : user.fullName,
			bio: bio ? bio : user.bio,
			email: email ? email : user.email,
			image: image ? image : user.image,
			hobbies: hobbies ? [...user.hobbies, ...hobbyArray] : user.hobbies,
			dob: dob ? dob : user.dob,
			location: location ? location : user.location,
		};

		const newuser = await UserModel.findOneAndUpdate({ _id: user._id }, { $set: data }, { new: true });

		res.json({ message: "Profile Updated Successfully", newuser });
	} catch (err) {
		next(err);
	}
};

export const userProfile = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	try {
		if (user) {
			res.json(user);
		}
	} catch (err) {
		next(err);
	}
};
