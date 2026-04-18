import mongoose from "mongoose";

const challengeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    challengeId: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

challengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const ChallengeProgress = mongoose.model(
  "ChallengeProgress",
  challengeProgressSchema
);
