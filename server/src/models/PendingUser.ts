import mongoose from 'mongoose';

const pendingSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  verificationToken: String,
  createdAt: { type: Date, default: Date.now, expires: 3600 }, 
});

export default mongoose.model('PendingUser', pendingSchema);