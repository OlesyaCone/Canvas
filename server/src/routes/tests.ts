import { Router } from "express";
import { protect } from "../middleware/auth";
import { createTest, updateTest, deleteTest, getTestById } from "../controllers/tests/crud";
import { getMyTests, getPassedTests } from "../controllers/tests/my";
import { submitTest } from "../controllers/tests/submit";
import { uploadTestImage } from "../controllers/upload";

const router = Router();

router.get("/my", protect, getMyTests);
router.get("/passed", protect, getPassedTests);
router.post(
  "/",
  protect,
  uploadTestImage.fields([
    { name: "img", maxCount: 1 },
    { name: "questionImgs", maxCount: 20 },
  ]),
  createTest,
);
router.get("/:id", protect, getTestById);
router.patch(
  "/:id",
  protect,
  uploadTestImage.fields([
    { name: "img", maxCount: 1 },
    { name: "questionImgs", maxCount: 20 },
  ]),
  updateTest,
);
router.delete("/:id", protect, deleteTest);
router.post("/:id/submit", protect, submitTest);

export default router;
