import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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
    imageSrc: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Course = mongoose.model("Course", courseSchema);
