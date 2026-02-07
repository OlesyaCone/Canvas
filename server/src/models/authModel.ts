import { Schema, model } from 'mongoose';

const TokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    refreshToken: { type: String, required: true },
});

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
});

export const Token = model('Token', TokenSchema);
export const User = model('User', UserSchema);