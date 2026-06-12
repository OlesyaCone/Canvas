import { Request, Response } from "express";
import Reaction from "../../models/social/Reaction";
import Test from "../../models/tests/Test";
import { getUserId } from "../../utils/getUserId";

export const toggleReaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const { type } = req.body;
  const testId = req.params.id;

  const existing = await Reaction.findOne({ user: userId, test: testId });

  if (existing) {
    if (existing.type === type) {
      await Reaction.deleteOne({ _id: existing._id });
      await Test.findByIdAndUpdate(testId, { $inc: { [type + "s"]: -1 } });
      res.json({ removed: true });
    } else {
      const oldType = existing.type;
      existing.type = type;
      await existing.save();
      await Test.findByIdAndUpdate(testId, {
        $inc: { [type + "s"]: 1, [oldType + "s"]: -1 },
      });
      res.json({ changed: true, type });
    }
  } else {
    await Reaction.create({ user: userId, test: testId, type });
    await Test.findByIdAndUpdate(testId, { $inc: { [type + "s"]: 1 } });
    res.json({ added: true, type });
  }
};
