import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatar: { type: String, default: "" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inviteCode: { type: String, unique: true },
    chatEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

groupSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
  next();
});

export default mongoose.model("Group", groupSchema);