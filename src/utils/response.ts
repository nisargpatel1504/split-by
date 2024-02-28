import { Response } from "express";
export const successResponse = (
  res: Response,
  data: any,
  message: string = "Fetched successfully",
  status: string = "Success"
) => {
  res.status(201).json({ status, data, message });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400
) => {
  res.status(statusCode).json({ message });
};
