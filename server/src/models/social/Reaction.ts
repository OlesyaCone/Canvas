import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    type: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: true },
);

reactionSchema.index({ user: 1, test: 1 }, { unique: true });

export default mongoose.model("Reaction", reactionSchema);
