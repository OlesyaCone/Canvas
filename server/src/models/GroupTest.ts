import mongoose from "mongoose";

const groupTestSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    deadline: { type: Date },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    results: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: Number,
        total: Number,
        answers: [{ questionIndex: Number, answer: String }],
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("GroupTest", groupTestSchema);
