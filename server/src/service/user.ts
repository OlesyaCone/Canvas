import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User as UserModel } from "../models/authModel";
import mailService from "./mail";
import tokenService from "./token";
import UserDto from "../dtos/userDto";
import ApiError from "../exceptions/apiError";
import type { UserType, LoginResponse } from "../types/auth";

class UserService {
  async registration(
    email: UserType["email"],
    password: UserType["password"],
  ): Promise<LoginResponse> {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже существует`,
      );
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();
    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
      provider: 'local'
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
    );

    const userDto = new UserDto({
      _id: user._id,
      email: user.email,
      isActivated: user.isActivated,
      provider: user.provider
    });
    
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userDto,
    };
  }

  async activate(
    activationLink: NonNullable<UserType["activationLink"]>,
  ): Promise<void> {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Некорректная ссылка активации");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(
    email: UserType["email"],
    password: UserType["password"],
  ): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не найден");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Неверный пароль");
    }

    const userDto = new UserDto({
      _id: user._id,
      email: user.email,
      isActivated: user.isActivated,
      provider: user.provider
    });

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userDto,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    
    if (!userData) {
      throw ApiError.UnauthorizedError();
    }
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    if (!user) {
      throw ApiError.UnauthorizedError();
    }

    const userDto = new UserDto({
      _id: user._id,
      email: user.email,
      isActivated: user.isActivated,
      provider: user.provider
    });

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userDto,
    };
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await UserModel.find();
    return users.map((user) => ({
      email: user.email,
      password: user.password,
      isActivated: user.isActivated,
      activationLink: user.activationLink || undefined,
      provider: user.provider || 'local'
    }));
  }
}

export default new UserService();