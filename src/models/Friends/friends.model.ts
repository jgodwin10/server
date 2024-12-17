import { model } from "mongoose";
import { IFriend } from "./friends.types";
import FriendSchema from "./friends.schema";

export const FriendModel = model<IFriend>("friend", FriendSchema);
