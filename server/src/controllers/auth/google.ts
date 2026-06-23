import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./generation";
import UserModel from "../../models/User";

export const googleAuth = (_req: Request, res: Response): void => {
  res.redirect("/api/auth/google/callback");
};

export const googleCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user as
      | { _id: string; email: string; username?: string; avatar?: string }
      | undefined;
    if (!user) {
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await UserModel.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        username: user.username || user.email?.split("@")[0],
        avatar: user.avatar || "",
        email: user.email,
      }),
    );
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&user=${userData}`,
    );
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};
