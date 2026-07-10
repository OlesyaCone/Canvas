import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
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
        timeLimit: { type: Number, default: 0 },
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
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["like", "dislike"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Test", testSchema);
