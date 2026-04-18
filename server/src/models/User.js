import mongoose from "mongoose";
import { MAX_HEARTS } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    imageSrc: {
      type: String,
      default: "/mascot.svg"
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user"
    },
    activeCourseId: {
      type: Number,
      default: null
    },
    hearts: {
      type: Number,
      default: MAX_HEARTS
    },
    points: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
