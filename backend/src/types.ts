import { Request, Response, NextFunction } from "express";

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UploadImageResponse {
  imageUrl: string | null;
  error?: string;
}

// Helper type for async request handlers
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void>;

export type AsyncErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
