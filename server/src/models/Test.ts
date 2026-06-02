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
  },
  { timestamps: true },
);

export default mongoose.model("Test", testingSchema);
