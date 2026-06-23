import { Request, Response } from "express";
import Test from "../../models/Test";
import { getUserId } from "../../utils/getUserId";

export const getPublicTests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { search, sort } = req.query;
  const userId = getUserId(req);
  let query: any = { visibility: "public" };
  if (search) query.title = { $regex: search as string, $options: "i" };
  let sortOption: any = { createdAt: -1 };
  if (sort === "likes") sortOption = { likes: -1 };
  if (sort === "passes") sortOption = { passes: -1 };
  const tests = await Test.find(query)
    .populate("author", "username avatar")
    .sort(sortOption);
  const testsWithMeta = tests.map((test) => {
    const testObj = test.toObject();
    if (userId) {
      const reaction = test.reactions.find(
        (r) => r.user?.toString() === userId,
      );
      (testObj as any).myReaction = reaction?.type || null;
    }
    (testObj as any).commentsCount = test.comments.length;
    return testObj;
  });
  res.json(testsWithMeta);
};
