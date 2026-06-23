import { Request, Response } from "express";
import Group from "../../models/Group";
import { getUserId } from "../../utils/getUserId";

export const getMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const group = await Group.findById(req.params.id).populate(
    "messages.user",
    "username avatar",
  );
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  res.json(group.messages);
};
