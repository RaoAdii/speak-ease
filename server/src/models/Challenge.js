import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    lessonId: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["SELECT", "ASSIST"],
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Challenge = mongoose.model("Challenge", challengeSchema);
