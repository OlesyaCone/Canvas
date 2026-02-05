import { validationResult, Result, ValidationError } from "express-validator";
import ApiError from "../exceptions/apiError";
import userService from "../service/user";
import { Request, Response, NextFunction } from "express";
import type { UserType, LoginResponse } from "types/auth";

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_CLIENT_URL = "http://localhost:3000";

class UserController {
  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie("refreshToken", token, {
      maxAge: REFRESH_TOKEN_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    });
  }

  private validateRefreshToken(refreshToken?: string): string {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    return refreshToken;
  }

  async registration(req: Request<{}, {}, Pick<UserType, "email" | "password">>, res: Response, next: NextFunction) {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        const errorArray: ValidationError[] = errors.array();
        return next(ApiError.BadRequest<ValidationError>("Ошибка при валидации", errorArray));
      }

      const { email, password } = req.body;
      const userData = await userService.registration(email, password);

      this.setRefreshTokenCookie(res, userData.refreshToken);
      return res.status(201).json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req: Request<{}, {}, Pick<UserType, "email" | "password">>, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      const loginResponse = userData as unknown as LoginResponse;

      this.setRefreshTokenCookie(res, loginResponse.refreshToken);
      return res.json({
        user: loginResponse.user,
        accessToken: loginResponse.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies || {};
      
      if (refreshToken) {
        await userService.logout(refreshToken);
      }
      
      res.clearCookie("refreshToken");
      return res.json({ message: "Успешный выход из системы" });
    } catch (e) {
      next(e);
    }
  }

  async activate(req: Request<{ link: string }>, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL || DEFAULT_CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies || {};
      const validRefreshToken = this.validateRefreshToken(refreshToken);
      
      const userData = await userService.refresh(validRefreshToken);
      const refreshResponse = userData as unknown as LoginResponse;
      
      this.setRefreshTokenCookie(res, refreshResponse.refreshToken);
      return res.json({
        user: refreshResponse.user,
        accessToken: refreshResponse.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
    
      const safeUsers = (users as any[]).map(user => ({
        _id: user._id,
        email: user.email,
        isActivated: user.isActivated,
        activationLink: user.activationLink,
      }));
      
      return res.json({
        success: true,
        count: safeUsers.length,
        users: safeUsers
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();