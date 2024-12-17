import { model } from "mongoose";
import UserSchema from "./users.schema";
import { IUser } from "./users.types";

export const UserModel = model<IUser>("user", UserSchema);
