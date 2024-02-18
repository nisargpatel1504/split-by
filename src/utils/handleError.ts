import { errorResponse } from "./response";

// In a new file like /utils/handleError.ts
export const handleTransactionError = async (
  session,
  res,
  message,
  statusCode = 400
) => {
  await session.abortTransaction();
  session.endSession();
  return errorResponse(res, message, statusCode);
};
