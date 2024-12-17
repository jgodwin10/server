import argon2 from "argon2";
import generateToken from "@/utils/generateToken";
import { Request, Response } from "express";
import { UserModel } from "@/models/Users/users.models";
import { verificationCode } from "./EmailController";

// REGISTRATION ENDPOINT CONTROLLER
export const signup = async (req: Request, res: Response) => {
	try {
		const { username, email, password, phoneNumber } = req.body;

		const userExist = await UserModel.findOne({ email });

		if (userExist) {
			return res.status(409).json({ message: "user already exist" });
		}

		const hashedPassword = await argon2.hash(password);

		const user = await UserModel.create({
			username,
			email,
			phoneNumber,
			password: hashedPassword,
		});

		//SEND DETAILS TO THE CLIENT SIDE
		if (user) {
			await verificationCode(email);

			const token = generateToken(res, user);
			res.status(201).json({
				message: `Registration succesful we have sent an email  verification to ${email} kindly open your inbox to verify account`,
				token,
			});
		} else {
			res.status(400).json({ message: "invalid user credentials" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error" });
	}
};

// LOGIN ENDPOINT CONTROLLER
export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const user: any = await UserModel.findOne({ email });

		if (!user) {
			return res.status(401).json({ message: "Invalid Credential" });
		}

		const isValidPassword = await argon2.verify(user.password, password);

		if (!isValidPassword) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const token = generateToken(res, user);

		// jwt.decode(token);
		res.setHeader("Authorization", `Bearer ${token}`);
		res.status(200).json({ message: "Login successful" });
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

// LOGOUT ENDPOINT CONTROLLER
export const logOut = (req: Request, res: Response) => {
	// Clears the cookie by setting its expiration date to the past
	res.cookie("jwt", "", {
		httpOnly: true, // Ensures the cookie is not accessible via JavaScript
		expires: new Date(0),
		secure: process.env.NODE_ENV === "production", // Use HTTPS in production
		sameSite: "strict", // Prevents the browser from sending the cookie along with cross-site requests
	});

	res.status(200).json({ message: "Logged out successfully" });
};

// RESET PASSWORD ENDPOINT CONTROLLER
export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const user = await UserModel.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });
		const token = await argon2.hash(user.id.toString());
		res.status(200).json({ message: `Reset password email sent to ${user.email}` });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
