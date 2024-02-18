import {
  validateInputs,
  isNonEmptyNumber,
  areValidObjectIds,
} from "../utils/validationInputs";
import {
  addExpenseToGroupAndUpdateBalances,
  addGroupExpense,
  getGroupUserBalance,
} from "../controllers/groupExpenseController";
import { isValidObjectId } from "mongoose";
import express from "express";
const router = express.Router();

//Routes for adding expenses to Group and Updating User Balance
// router.route("/").post(
//   validateInputs({
//     groupId: isValidObjectId,
//     payerId: isValidObjectId,
//     amount: isNonEmptyNumber,
//     involvedMembers: areValidObjectIds,
//   }),
//   addExpenseToGroupAndUpdateBalances
// );

router.route("/:groupId").post(
  validateInputs({
    groupId: isValidObjectId,
    paidBy: isValidObjectId,
    amount: isNonEmptyNumber,
    participants: areValidObjectIds,
  }),
  addGroupExpense
);

export default router;
