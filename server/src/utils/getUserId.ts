import { Request } from "express";
import jwt from "jsonwebtoken";

export const getUserId = (req: Request): string | null => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
};