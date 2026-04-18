import mongoose from "mongoose";

const challengeOptionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    challengeId: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    correct: {
      type: Boolean,
      required: true
    },
    imageSrc: {
      type: String,
      default: null
    },
    audioSrc: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const ChallengeOption = mongoose.model(
  "ChallengeOption",
  challengeOptionSchema
);
