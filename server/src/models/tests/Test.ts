import mongoose from "mongoose";

const testingSchema = new mongoose.Schema(
  {
    title: String,
    img: String,
    description: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    question: [
      {
        question: String,
        img: String,
        answers: [String],
        correctAnswer: String,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "group", "private"],
      default: "private",
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    passes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Test", testingSchema);
