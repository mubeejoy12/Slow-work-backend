import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "host" | "guest" | "admin";

export interface IUser extends Document {
  id: string; // add this line
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  bio?: string;
  pricePerSession?: number;
  languages?: string[];
  timezone?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["host", "guest", "admin"], default: "guest" },
    bio: String,
    pricePerSession: Number,
    languages: [String],
    timezone: String,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
