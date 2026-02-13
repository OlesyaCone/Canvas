import { validationResult, Result, ValidationError } from "express-validator";
import ApiError from "../exceptions/apiError";
import userService from "../service/user";
import { Request, Response, NextFunction } from "express";
import type { UserType} from "src/types/auth";

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_CLIENT_URL = "http://localhost:3000";

class UserController {
  private setRefreshTokenCookie = (res: Response, token: string): void => {
    res.cookie("refreshToken", token, {
      maxAge: REFRESH_TOKEN_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    });
  }

  private validateRefreshToken = (refreshToken?: string): string => {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    return refreshToken;
  }

  registration = async (
    req: Request<{}, {}, Pick<UserType, "email" | "password">>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const errors: Result<ValidationError> = validationResult(req);

      if (!errors.isEmpty()) {
        const errorArray: ValidationError[] = errors.array();
        return next(
          ApiError.BadRequest<ValidationError>(
            "Ошибка при валидации",
            errorArray,
          ),
        );
      }

      const { email, password } = req.body;
      const userData = await userService.registration(email, password);

      this.setRefreshTokenCookie(res, userData.refreshToken);
      return res.status(201).json(userData);
    } catch (e) {
      next(e);
    }
  }

  login = async (
    req: Request<{}, {}, Pick<UserType, "email" | "password">>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);

      this.setRefreshTokenCookie(res, userData.refreshToken);
      return res.json({
        user: userData.user,
        accessToken: userData.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
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

  activate = async (
    req: Request<{ link: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL || DEFAULT_CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { refreshToken } = req.cookies || {};
      const validRefreshToken = this.validateRefreshToken(refreshToken);

      const userData = await userService.refresh(validRefreshToken);

      this.setRefreshTokenCookie(res, userData.refreshToken);
      return res.json({
        user: userData.user,
        accessToken: userData.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }

  getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const users = await userService.getAllUsers();
      
      return res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();