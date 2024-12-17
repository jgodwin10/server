import { model } from "mongoose";
import { IPost } from "./posts.types";
import PostSchema from "./post.schema";

export const PostModel = model<IPost>("post", PostSchema);
