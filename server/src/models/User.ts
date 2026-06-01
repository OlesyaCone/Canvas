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
  },
  { timestamps: true }
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

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;