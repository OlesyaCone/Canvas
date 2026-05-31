import { Router } from "express";
import { register, login } from "../controllers/auth/register";
import { refresh, logout, verifyEmail } from "../controllers/auth/tokens";
import { protect } from "../middleware/auth";
import passport from "../config/passport";
import { googleCallback } from "../controllers/auth/google";
import { getProfile, updateProfile } from "../controllers/user";
import {
  getMyTests,
  getPassedTests,
  createTest,
  getTestById,
  submitTest,
  updateTest,
  deleteTest
} from "../controllers/tests";
import { upload, uploadTestImage, getFile } from "../controllers/upload";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", protect, logout);
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleCallback
);
authRouter.get("/verify/:token", verifyEmail);
authRouter.patch("/profile", protect, upload.single("avatar"), updateProfile);
authRouter.get("/profile", protect, getProfile);
authRouter.get("/uploads/*", getFile);

const testRouter = Router();
testRouter.get("/my", protect, getMyTests);
testRouter.get("/passed", protect, getPassedTests);
testRouter.post(
  "/",
  protect,
  uploadTestImage.fields([
    { name: "img", maxCount: 1 },
    { name: "questionImgs", maxCount: 20 },
  ]),
  createTest
);
testRouter.post('/:id/submit', protect, submitTest);
testRouter.get("/:id", protect, getTestById);

export const setupRoutes = (app: any) => {
  app.use("/api/auth", authRouter);
  app.use("/api/tests", testRouter);
};

testRouter.patch('/:id', protect, uploadTestImage.fields([
  { name: 'img', maxCount: 1 },
  { name: 'questionImgs', maxCount: 20 }
]), updateTest);
testRouter.delete('/:id', protect, deleteTest);