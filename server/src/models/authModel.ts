import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    googleId: { type: String, unique: true, sparse: true }, 
    displayName: { type: String },
    avatar: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' }
});

const TokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    refreshToken: { type: String, required: true },
});

export const Token = model('Token', TokenSchema);
export const User = model('User', UserSchema);