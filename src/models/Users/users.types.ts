export interface IUser {
	fullName: string;
	dob: Date;
	email: string;
	hobbies: [string];
	username: string;
	post: number;
	follower: number;
	following: number;
	image: object;
	bio: string;
	password: string;
	email_verified: boolean;
}
