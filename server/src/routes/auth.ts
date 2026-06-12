import { Router } from "express";
import { register, login } from "../controllers/auth/register";
import { refresh, logout, verifyEmail } from "../controllers/auth/tokens";
import { protect } from "../middleware/auth";
import passport from "../config/passport";
import { googleCallback } from "../controllers/auth/google";
import {
  getProfile,
  updateProfile,
  getProfileStats,
} from "../controllers/user";
import { upload, getFile } from "../controllers/upload";
import { getPublicTests } from "../controllers/tests/public";
import { toggleReaction } from "../controllers/social/reactions";
import {
  getComments,
  addComment,
  deleteComment,
} from "../controllers/social/comments";
import testRoutes from "./tests";
import groupRoutes from "./groups";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", protect, logout);
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleCallback,
);
authRouter.get("/verify/:token", verifyEmail);
authRouter.patch("/profile", protect, upload.single("avatar"), updateProfile);
authRouter.get("/profile", protect, getProfile);
authRouter.get("/profile/stats", protect, getProfileStats);
authRouter.get("/uploads/*", getFile);

authRouter.get("/tests/public", getPublicTests);
authRouter.post("/tests/:id/reaction", protect, toggleReaction);
authRouter.get("/tests/:id/comments", getComments);
authRouter.post("/tests/:id/comments", protect, addComment);
authRouter.delete("/tests/:id/comments/:commentId", protect, deleteComment);

export const setupRoutes = (app: any) => {
  app.use("/api/auth", authRouter);
  app.use("/api/tests", testRoutes);
  app.use("/api/groups", groupRoutes);
};
