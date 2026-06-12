import { Request, Response } from "express";
import Test from "../../models/tests/Test";
import Reaction from "../../models/social/Reaction";
import { getUserId } from "../../utils/getUserId";

export const getPublicTests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { search, sort } = req.query;
  const userId = getUserId(req);

  let query: any = { visibility: "public" };
  if (search) {
    query.title = { $regex: search as string, $options: "i" };
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === "likes") sortOption = { likes: -1 };
  if (sort === "passes") sortOption = { passes: -1 };

  const tests = await Test.find(query)
    .populate("author", "username avatar")
    .sort(sortOption);

  const testsWithReaction = await Promise.all(
    tests.map(async (test) => {
      const testObj = test.toObject();
      if (userId) {
        const reaction = await Reaction.findOne({
          user: userId,
          test: test._id,
        });
        (testObj as any).myReaction = reaction?.type || null;
      }
      return testObj;
    }),
  );

  res.json(testsWithReaction);
};
