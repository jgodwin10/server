import { EmailModel } from "@/models/Email/email.model";
import { UserModel } from "@/models/Users/users.models";
import emailService from "@/services/emailService";
import { NextFunction, Request, Response } from "express";

export const verificationCode = async (email: string) => {
	const findEmail = await EmailModel.findOne({ email });

	try {
		if (findEmail) {
			const date: any = findEmail.createdAt;

			//CREATE DATE
			const date1: any = new Date(date);
			const date2: any = new Date();

			//CALCULATE THE TIME
			const diffInMs = Math.abs(date2 - date1);
			const diffInMinutes = Math.floor(diffInMs / 1000 / 60);

			//CHECK TO SEE IF THE TIME IS MORE THAN 30 MINS
			if (diffInMinutes < 30) {
				const num = findEmail.otp;

				emailService(email, num);
			} else {
				const data = await EmailModel.findOneAndDelete({ email });

				if (data) {
					const otp = emailService(email);

					await EmailModel.create({
						email,
						otp,
					});
				}
			}
		} else {
			const otp = emailService(email);

			await EmailModel.create({
				email,
				otp,
			});
		}

		return { message: "Otp sent" };
	} catch (err) {
		throw Error("Otp not sent");
	}
};

//THIS IS AN ENDPOINT FOR CREATING AND RESENING OTP/CODE
export const createVerification = async (req: Request, res: Response) => {
	const { email } = req.user;

	try {
		const data = await verificationCode(email);

		res.json(data);
	} catch (err) {
		console.log(err);
	}
};

//THIS IS AN ENDPOINT FOR VERIFYING EMAIL USING CODES SENT TO EMAIL
export const VerifyEmailCode = async (req: Request, res: Response, next: NextFunction) => {
	const { otp } = req.body;
	const { email } = req.user;

	try {
		const data = { email_verified: true };

		const findEmail = await EmailModel.findOne({ email });

		if (findEmail) {
			if (findEmail.otp == otp) {
				await EmailModel.findOneAndDelete({ email });

				await UserModel.findOneAndUpdate({ email }, { $set: data }, { new: true });

				res.json({
					message: "Congratulations your Email has been verified",
				});
			} else {
				throw new Error("OTP is incorrect or has expired");
			}
		}
		throw new Error("OTP is incorrect or has expired");
	} catch (err: any) {
		next(err);
	}
};
