import express from "express";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
} from "../controllers/expenseController";
const router = express.Router();

router.route("/").post(createExpense);
router.route("/:id").get(getExpenseById).delete(deleteExpense);

export default router;
