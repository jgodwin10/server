import JWT from "jsonwebtoken";
import { Response } from "express";

const jwtSecret = process.env.JWT_SECRET || "test@123";
const Secure = process.env.NODE_ENV == "development" ? false : false;

const generateToken = (res: Response, user: any) => {
	const { _id, email } = user;

	const token = JWT.sign({ id: _id, email }, jwtSecret, { expiresIn: "30d" });
	res.cookie("jwt", token, {
		httpOnly: true,
		secure: false,
		sameSite: "strict",
		maxAge: 30 * 24 * 60 * 60 * 1000,
	});
	return token;
};

export default generateToken;
