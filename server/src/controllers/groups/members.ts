import { Request, Response } from "express";
import Group from "../../models/Group";
import UserModel from "../../models/User";
import { getUserId } from "../../utils/getUserId";

export const joinGroup = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const { inviteCode } = req.body;
  const group = await Group.findOne({ inviteCode });
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (group.members.some(id => id.toString() === userId)) { res.status(400).json({ message: "Вы уже в группе" }); return; }

  group.members.push(userId as any);
  await group.save();
  await UserModel.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });
  res.json(group);
};

export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const group = await Group.findById(req.params.id);
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (group.admin.toString() === userId) { res.status(400).json({ message: "Админ не может покинуть группу" }); return; }

  group.members = group.members.filter(id => id.toString() !== userId);
  await group.save();
  await UserModel.findByIdAndUpdate(userId, { $pull: { groups: group._id } });
  res.json({ message: "Вы покинули группу" });
};

export const kickMember = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const group = await Group.findById(req.params.id);
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (group.admin.toString() !== userId) { res.status(403).json({ message: "Нет прав" }); return; }

  const targetId = req.params.userId;
  group.members = group.members.filter(id => id.toString() !== targetId);
  group.moderators = group.moderators.filter(id => id.toString() !== targetId);
  await group.save();
  await UserModel.findByIdAndUpdate(targetId, { $pull: { groups: group._id } });
  res.json({ message: "Участник исключён" });
};

export const promoteMember = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const group = await Group.findById(req.params.id);
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (group.admin.toString() !== userId) { res.status(403).json({ message: "Нет прав" }); return; }

  const targetId = req.params.userId;
  if (!group.members.some(id => id.toString() === targetId)) { res.status(404).json({ message: "Участник не в группе" }); return; }
  if (!group.moderators.some(id => id.toString() === targetId)) {
    group.moderators.push(targetId as any);
    await group.save();
  }
  res.json(group);
};