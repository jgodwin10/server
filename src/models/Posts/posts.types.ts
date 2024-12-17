export interface IPost {
	user: {
		_id: string;
	};
	text: string;
	images: [object];
	videos: [object];
	likes: [string];
	dislikes: [string];
	shares: [string];
	comments: number;
	created_At: Date;
	createdAt: Date;
	// user: string
	_id: string;
}
