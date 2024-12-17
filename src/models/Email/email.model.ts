import { model } from "mongoose";
import EmailSchema from "./email.schema";
import { IEmail } from "./email.types";

export const EmailModel = model<IEmail>("verification", EmailSchema);
