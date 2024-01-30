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

    next(); // Proceed to the next middleware/controller if validation passes
  };
};

export const isValidObjectId = (value: any): boolean =>
  mongoose.Types.ObjectId.isValid(value);
export const isNonEmptyString = (value: any): boolean =>
  typeof value === "string" && value.trim() !== "";
