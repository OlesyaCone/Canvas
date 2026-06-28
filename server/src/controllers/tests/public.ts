import { Request, Response } from "express";
import Test from "../../models/Test";
import { getUserId } from "../../utils/getUserId";

interface QueryParams {
  search?: string;
  sort?: string;
}

export const getPublicTests = async (req: Request, res: Response): Promise<void> => {
  const { search, sort } = req.query as QueryParams;
  const userId = getUserId(req);

  const query: Record<string, unknown> = { visibility: "public" };
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  let sortOption: Record<string, number> = { createdAt: -1 };
  if (sort === "likes") sortOption = { likes: -1 };
  if (sort === "passes") sortOption = { passes: -1 };

  const tests = await Test.find(query)
    .populate("author", "username avatar")
    .sort(sortOption as Record<string, 1 | -1>);

  const testsWithMeta = tests.map((test) => {
    const testObj = test.toObject() as Record<string, unknown>;
    if (userId) {
      const reaction = test.reactions.find((r) => r.user?.toString() === userId);
      testObj.myReaction = reaction?.type || null;
    }
    testObj.commentsCount = test.comments.length;
    return testObj;
  });

  res.json(testsWithMeta);
};
