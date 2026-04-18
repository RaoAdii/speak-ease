import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    unitId: {
      type: Number,
      required: true
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

export const Lesson = mongoose.model("Lesson", lessonSchema);
