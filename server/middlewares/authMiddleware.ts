import ApiError from "../exceptions/apiError";
import tokenService from "../service/token";
import { Request, Response, NextFunction } from "express";
import {UserType, AuthenticatedRequest } from "../types/auth";

export default function authMiddleware(
  req: AuthenticatedRequest,  
  res: Response, 
  next: NextFunction
) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const parts = authorizationHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = parts[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData as UserType; 

    next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}