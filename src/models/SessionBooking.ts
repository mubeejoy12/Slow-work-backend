import mongoose, { Schema, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface ISessionBooking extends Document {
  hostId: Types.ObjectId;
  guestId: Types.ObjectId;
  startTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SessionBookingSchema = new Schema<ISessionBooking>(
  {
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    guestId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const SessionBooking = mongoose.model<ISessionBooking>(
  "SessionBooking",
  SessionBookingSchema
);
