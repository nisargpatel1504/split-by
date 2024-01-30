import express from "express";
import {
  createPersonalExpense,
  deletePersonalExpense,
  getPersonalExpenseById,
} from "../controllers/expenseController";
const router = express.Router();
import {
  validateInputs,
  isValidObjectId,
  isNonEmptyString,
} from "../utils/validationInputs";

router.route("/").post(
  validateInputs({
    groupId: isValidObjectId,
    newMemberId: isValidObjectId,
    adminId: isValidObjectId,
  }),
  createPersonalExpense
);

router
  .route("/:id")
  .get(
    validateInputs({
      payer: isNonEmptyString,
    }),
    getPersonalExpenseById
  )
  .delete(
    validateInputs({
      payer: isNonEmptyString,
    }),
    deletePersonalExpense
  );
// router.route('/').get()
export default router;
