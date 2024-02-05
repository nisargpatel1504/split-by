import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

type ValidationRules = {
  [key: string]: (value: any) => boolean;
};
export const validateInputs = (validationRules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const [key, validate] of Object.entries(validationRules)) {
      const value = req.body[key] || req.params[key];

      if (!validate(value)) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }
    }
    next();
  };
};

export const isValidObjectId = (value: any): boolean => {
  const isValid = mongoose.Types.ObjectId.isValid(value);
  console.log(`Validating ObjectId: ${value}, isValid: ${isValid}`);
  return isValid;
};

export const isNonEmptyString = (value: any): boolean =>
  typeof value === "string" && value.trim() !== "";
export const isNonEmptyNumber = (value: any): boolean => {
  // If allowing string representations of numbers:
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;

  // Check if it's a number, not NaN, and optionally, positive and an integer
  const isValid =
    typeof parsedValue === "number" &&
    !isNaN(parsedValue) &&
    parsedValue > 0 &&
    Number.isInteger(parsedValue);

  return isValid;
};

export const areValidObjectIds = (values) => {
  const isValid =
    Array.isArray(values) &&
    values.every((id) => mongoose.Types.ObjectId.isValid(id));
  return isValid;
};
