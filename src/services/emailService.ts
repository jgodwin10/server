import nodemailer from "nodemailer";

const emailService = (email: string, num?: string) => {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "appmosphere6@gmail.com",
			pass: "iznvluqefcumhhxa",
		},
	});

	//generate random code
	function generateRandomNumbers() {
		let randomNumbers = [];
		for (let i = 0; i < 5; i++) {
			let randomNumber = Math.abs(Math.floor(Math.random() * (1 - 10 + 1)) + 1);
			randomNumbers.push(randomNumber);
		}
		return randomNumbers.join("");
	}

	const code = generateRandomNumbers();

	const mailOptions = {
		from: {
			name: "Appmosphere",
			address: "appmosphere6@gmail.com",
		}, // sender address
		to: `${email}`, // list of receivers
		subject: `Your Code - ${num ? num : code}`, // Subject line
		text: `Hello
		
Your confirmation code is: ${num ? num : code}. Use it to verify your email for Login.

if you didn't request this, simply ignore this message.

Yours,
The Appmosphere Team`, // plain text body
	};

	transporter.sendMail(mailOptions, function (err: any) {
		if (err) console.log(err);
		else return;
	});

	//RETURN THE OTP CODE
	return code;
};

export default emailService;
