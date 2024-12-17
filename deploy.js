import ftp from "basic-ftp";
import dotenv from "dotenv";

dotenv.config();

async function deploy() {
	const client = new ftp.Client();
	client.ftp.verbose = true; // Enable logging for debugging

	try {
		// Connect to FTP
		await client.access({
			host: process.env.FTP_HOST,
			user: process.env.FTP_USERNAME,
			password: process.env.FTP_PASSWORD,
			port: process.env.FTP_PORT || 21,
		});

		console.log("Connected to FTP!");

		// Navigate to remote directory
		await client.ensureDir(process.env.FTP_TARGET_DIR);
		await client.clearWorkingDir(); // Optional: Clear the directory before deployment

		// Upload files
		await client.uploadFromDir("./dist"); // Specify your build folder
		console.log("Deployment complete!");
	} catch (err) {
		console.error("Deployment failed:", err);
	} finally {
		client.close();
	}
}

deploy();
