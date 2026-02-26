import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User as UserModel } from "../models/authModel";
import tokenService from "./token";
import UserDto from "../dtos/userDto";
import ApiError from "../exceptions/apiError";
import type { GoogleProfileType, GoogleAuthResponse } from "../types/auth";
import crypto from 'crypto';

class GoogleAuthService {
  async findOrCreateUser(profile: GoogleProfileType): Promise<{ user: any; isNewUser: boolean }> {
    const email = profile.emails?.[0]?.value;
    
    if (!email) {
      throw ApiError.BadRequest('Email не предоставлен Google');
    }

    let user = await UserModel.findOne({
      $or: [
        { email },
        { googleId: profile.id }
      ]
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const hashPassword = await bcrypt.hash(randomPassword, 3);
      const activationLink = uuidv4();

      user = await UserModel.create({
        email,
        password: hashPassword,
        googleId: profile.id,
        displayName: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        isActivated: profile.emails?.[0]?.verified || false,
        provider: 'google',
        activationLink
      });
      
    } else if (!user.googleId) {
      user.googleId = profile.id;
      user.displayName = user.displayName || profile.displayName;
      user.avatar = user.avatar || profile.photos?.[0]?.value;
      user.provider = 'google';
      await user.save();
    }

    return { user, isNewUser };
  }

  async authenticate(profile: GoogleProfileType): Promise<GoogleAuthResponse> {
    const { user, isNewUser } = await this.findOrCreateUser(profile);

    const userDto = new UserDto({
      _id: user._id,
      email: user.email,
      isActivated: user.isActivated,
      displayName: user.displayName,
      avatar: user.avatar,
      provider: user.provider
    });

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userDto,
      isNewUser
    };
  }
}

export default new GoogleAuthService();