import { Request, Response } from "express";
import Group from "../../models/Group";
import UserModel from "../../models/User";
import { getUserId } from "../../utils/getUserId";

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const { name, description } = req.body;
  const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : "";
  const group = await Group.create({
    name,
    description,
    avatar,
    admin: userId,
    members: [userId],
  });
  await UserModel.findByIdAndUpdate(userId, { $push: { groups: group._id } });
  res.status(201).json(group);
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  if (group.admin.toString() !== userId) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }
  const { name, description } = req.body;
  const avatar = req.file ? `/uploads/groups/${req.file.filename}` : group.avatar;
  const updated = await Group.findByIdAndUpdate(
    req.params.id,
    { name, description, avatar },
    { new: true },
  );
  res.json(updated);
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  if (group.admin.toString() !== userId) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }
  await UserModel.updateMany({ groups: group._id }, { $pull: { groups: group._id } });
  await Group.findByIdAndDelete(req.params.id);
  res.json({ message: "Группа удалена" });
};

export const getGroup = async (req: Request, res: Response): Promise<void> => {
  const group = await Group.findById(req.params.id)
    .populate("admin", "username avatar")
    .populate("moderators", "username avatar")
    .populate("members", "username avatar");

  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  res.json(group);
};

export const getMyGroups = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const groups = await Group.find({ members: userId })
    .populate("admin", "username avatar")
    .sort({ createdAt: -1 });
  res.json(groups);
};
