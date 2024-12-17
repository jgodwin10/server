import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

export const uploadToCloudinary = (path: any, folder: string) => {
	return cloudinary.uploader
		.upload(path, {
			folder,
		})
		.then((data) => {
			return { url: data.url, public_id: data.public_id };
		})
		.catch((error) => {
			console.log(error);
		});
};

export const removeFromCloudinary = async (public_id: string) => {
	await cloudinary.uploader.destroy(public_id, function (error, result) {
		console.log(result, error);
	});
};
