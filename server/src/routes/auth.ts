import { Router } from "express";
import { register, login } from "../controllers/auth/register";
import { refresh, logout, verifyEmail } from "../controllers/auth/tokens";
import { protect } from "../middleware/auth";
import passport from "../config/passport";
import { googleCallback } from "../controllers/auth/google";
import { getProfile, updateProfile } from "../controllers/user";
import { upload, getFile } from "../controllers/upload";
import testRoutes from "./tests";
import groupRoutes from "./groups";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", protect, logout);
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/" }), googleCallback);
authRouter.get("/verify/:token", verifyEmail);
authRouter.patch("/profile", protect, upload.single("avatar"), updateProfile);
authRouter.get("/profile", protect, getProfile);
authRouter.get("/uploads/*", getFile);

export const setupRoutes = (app: any) => {
  app.use("/api/auth", authRouter);
  app.use("/api/tests", testRoutes);
  app.use("/api/groups", groupRoutes);
};