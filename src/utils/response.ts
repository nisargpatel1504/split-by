import { Response } from "express";
export const successResponse = (
  res: Response,
  data: any,
  message: string = "Success"
) => {
  res.status(201).json({ message, data });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400
) => {
  res.status(statusCode).json({ message });
};
