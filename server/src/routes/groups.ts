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
import { submitGroupResult, getGroupResults, getTestStats } from "../controllers/groups/results";
import { getMessages } from "../controllers/social/messages";
import { upload } from "../controllers/upload";

const router = Router();

router.post("/", protect, upload.single("avatar"), createGroup);
router.get("/my", protect, getMyGroups);

router.post("/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);
router.post("/:id/kick/:userId", protect, kickMember);
router.post("/:id/promote/:userId", protect, promoteMember);
router.post("/:id/demote/:userId", protect, demoteMember);

router.post("/:id/tests", protect, assignTest);
router.get("/:id/tests", protect, getGroupTests);
router.post("/:id/tests/:testId/submit", protect, submitGroupResult);
router.get("/:id/tests/:testId/stats", protect, getTestStats);
router.get("/:id/results", protect, getGroupResults);

router.get("/:id", protect, getGroup);
router.patch("/:id", protect, upload.single("avatar"), updateGroup);
router.delete("/:id", protect, deleteGroup);

router.get("/:id/messages", protect, getMessages);

export default router;
