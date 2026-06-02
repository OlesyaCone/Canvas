import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  getMyGroups,
} from "../controllers/groups/crud";
import {
  joinGroup,
  leaveGroup,
  kickMember,
  promoteMember,
  demoteMember,
} from "../controllers/groups/members";
import { assignTest, getGroupTests } from "../controllers/groups/tests";
import {
  submitGroupResult,
  getGroupResults,
} from "../controllers/groups/results";
import { upload } from "../controllers/upload";

const router = Router();

router.post("/", protect, upload.single("avatar"), createGroup);
router.get("/my", protect, getMyGroups);
router.get("/:id", protect, getGroup);
router.patch("/:id", protect, upload.single("avatar"), updateGroup);
router.delete("/:id", protect, deleteGroup);

router.post("/:id/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);
router.post("/:id/kick/:userId", protect, kickMember);
router.post("/:id/promote/:userId", protect, promoteMember);
router.post("/:id/demote/:userId", protect, demoteMember);

router.post("/:id/tests", protect, assignTest);
router.get("/:id/tests", protect, getGroupTests);

router.post("/:id/tests/:testId/submit", protect, submitGroupResult);
router.get("/:id/results", protect, getGroupResults);

export default router;
