import jwt from "jsonwebtoken";
import { Token as TokenModel } from "../models/authModel";
import type { TokenDbType, UserDtoType } from "../types/auth";

class TokenService {
  generateTokens(payload: UserDtoType): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15s",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "30s",
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token: string): UserDtoType | null {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as UserDtoType;
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token: string): UserDtoType | null {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as UserDtoType;
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: string, refreshToken: string): Promise<TokenDbType> {
    const tokenData = await TokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      await tokenData.save();
      return {
        user: tokenData.user?.toString() || userId,
        refreshToken: tokenData.refreshToken,
        _id: tokenData._id?.toString()
      };
    }
    const token = await TokenModel.create({ user: userId, refreshToken });
    return {
      user: token.user?.toString() || userId,
      refreshToken: token.refreshToken,
      _id: token._id?.toString()
    };
  }

  async removeToken(refreshToken: string): Promise<{ deletedCount?: number }> {
    const tokenData = await TokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  async findToken(refreshToken: string): Promise<TokenDbType | null> {
    const tokenData = await TokenModel.findOne({ refreshToken });
    if (!tokenData) return null;
    return {
      user: tokenData.user?.toString() || '',
      refreshToken: tokenData.refreshToken,
      _id: tokenData._id?.toString()
    };
  }
}

export default new TokenService();