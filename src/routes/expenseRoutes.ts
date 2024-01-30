import express from "express";
import {
  createPersonalExpense,
  deletePersonalExpense,
  getPersonalExpenseById,
} from "../controllers/expenseController";
const router = express.Router();

router.route("/").post(createPersonalExpense);
router.route("/:id").get(getPersonalExpenseById).delete(deletePersonalExpense);
// router.route('/').get()
export default router;
