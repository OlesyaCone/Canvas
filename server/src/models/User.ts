import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  password?: string;
  displayName: string;
  avatar: string;
  provider: 'local' | 'google';
  googleId?: string;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  comparePassword(p: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  displayName: String,
  avatar: { type: String, default: '' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, sparse: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (p: string) {
  return this.password ? bcrypt.compare(p, this.password) : false;
};

export default mongoose.model<IUser>('User', userSchema);