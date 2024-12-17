import express from "express";

interface IStringIndex {
	filename: string[];
}

export type IFile = {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
};

declare global {
	namespace Express {
		interface Request {
			user?: Record<string, any, null>;
			files?: IFile;
		}
	}
}
