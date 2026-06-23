import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  _id: string;
  email: string;
  username: string;
  password?: string;
  avatar: string;
  provider: "local" | "google";
  googleId?: string;
  refreshToken?: string;
  isVerified: boolean;
  myTests: mongoose.Types.ObjectId[];
  passedTests: mongoose.Types.ObjectId[];
  groups: mongoose.Types.ObjectId[];
  notifications: {
    from: mongoose.Types.ObjectId;
    type: string;
    text: string;
    link?: string;
    read: boolean;
    createdAt: Date;
  }[];
  createdAt: Date;
  comparePassword(p: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    avatar: { type: String, default: "" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, sparse: true },
    refreshToken: String,
    isVerified: { type: Boolean, default: false },
    myTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    passedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    notifications: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
          type: String,
          enum: ["test_assigned", "comment", "like", "dislike"],
        },
        text: String,
        link: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (p: string) {
  return this.password ? bcrypt.compare(p, this.password) : false;
};

export default mongoose.model<IUser>("User", userSchema);
