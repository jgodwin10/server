import { UserModel } from "@/models/Users/users.models";
import { NextFunction, Request, Response } from "express";

export const Follow = async (req: Request, res: Response) => {
	const user = req.user;
	const userId = user._id;
	const { followId } = req.body;

	if (userId == followId) {
		return res.status(400).json({ message: "You cannot follow yourself you fool" });
	}

	try {
		const userToFollow = await UserModel.findById(followId);

		if (!userToFollow) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user?.followings?.includes(followId)) {
			const unfollow = await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { followings: followId } }, { new: true });
			const unfollowUser = await UserModel.findOneAndUpdate({ _id: followId }, { $pull: { followers: userId } }, { new: true });

			return res.status(200).json({ message: "Unfollow succesfully", unfollow, unfollowUser });
		}

		const follow = await UserModel.findOneAndUpdate({ _id: userId }, { $push: { followings: followId } }, { new: true });
		const followUser = await UserModel.findOneAndUpdate({ _id: followId }, { $push: { followers: userId } }, { new: true });

		res.status(200).json({ message: "Follow succesfully", follow, followUser });
	} catch (err) {
		res.status(500).json({ message: "Internal error" });
	}
};

export const Friends = async (req: Request, res: Response) => {
	const user = req.user;

	try {
		const follower = user?.followers?.map((follower: any) => follower.toString());
		const following = user?.followings?.map((follow: any) => follow.toString());

		const uniqueSet = [...new Set([...follower, ...following])];

		const Users = await UserModel.find({ _id: { $in: uniqueSet } }, { password: 0 });

		res.status(200).json(Users);
	} catch (err) {
		res.status(500).json({ message: "Internal error" });
	}
};

export const Followers = async (req: Request, res: Response) => {
	const user = req.user;

	try {
		const follower = user?.followers?.map((follower: any) => follower.toString());

		const uniqueSet = [...new Set([...follower])];

		const Users = await UserModel.find({ _id: { $in: uniqueSet } }, { password: 0 });

		res.status(200).json(Users);
	} catch (err) {
		res.status(500).json({ message: "Internal error" });
	}
};

export const AllUsers = async (req: Request, res: Response) => {
	const user = req.user;

	try {
		const allUsers = await UserModel.find({ _id: { $ne: user._id } }, { password: 0 });

		res.status(200).json(allUsers);
	} catch (err) {
		res.status(500).json({ message: "Internal Error" });
	}
};
