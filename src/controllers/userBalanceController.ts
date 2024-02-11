import { ErrorResponse } from "../interfaces/commonInterface";
import { GroupExpenseResponse } from "../interfaces/groupExpensesInterface";
import { findUserBalanceByPayerId } from "../services/UserBalanceService";
import redisClient from "../utils/redisClient";
import { errorResponse, successResponse } from "../utils/response";
import { Request, Response } from "express";

export const getUserBalance = async (
  req: Request,
  res: Response<GroupExpenseResponse | ErrorResponse>
): Promise<void> => {
  const { payerId } = req.params;

  // Try to fetch from cache first
  const cacheKey: string = `userBalance:${payerId}`;
  const cachedData: string | null = await redisClient.get(cacheKey);

  // If not in cache, fetch from database and cache the result
  try {
    const userBalance = await findUserBalanceByPayerId(payerId, null);

    if (!userBalance) {
      return successResponse(res, "No details found");
    }

    return successResponse(res, {
      details: userBalance,
      message: "User Balance Data",
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};
