import JWT from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { UserModel } from "@/models/Users/users.models";

interface IDecode {
	id: string;
	address: string;
	role: string;
	iat: number;
	exp: number;
}

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	let token;

	// Retrieve token from cookies or Authorization header
	if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
	} else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (token) {
		try {
			// Verify the token
			if (!process.env.JWT_SECRET) {
				throw new Error("JWT_SECRET is not defined");
			}

			const decoded = <IDecode>JWT.verify(token, process.env.JWT_SECRET);

			// Attach user to the request object
			const user = await UserModel.findById(decoded.id, { password: 0 });

			req.user = user;

			if (!req.user) {
				res.status(404);
				throw new Error("User not found");
			}

			next(); // Proceed to the next middleware or route handler
		} catch (err: any) {
			console.error("Token Verification Error:", err.message); // Log error message
			res.status(401);
			throw new Error("Invalid token");
		}
	} else {
		res.status(400);
		throw new Error("Not authorized, no token");
	}
});

export default protect;
