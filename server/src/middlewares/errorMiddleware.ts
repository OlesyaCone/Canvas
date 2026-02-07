import ApiError from "../exceptions/apiError";
import { Request, Response, NextFunction } from "express";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(err);
  
  if (err instanceof ApiError) {
    res.status(err.status).json({ 
      message: err.message, 
      errors: err.errors || [] 
    });
    return;
  }
  
  res.status(500).json({ message: "Непредвиденная ошибка" });
}