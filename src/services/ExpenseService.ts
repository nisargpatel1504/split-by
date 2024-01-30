import Expense from "../models/ExpenseModel";


export const findExpenseById = async (payerID: string) => {
  return await Expense.findById(payerID);
};

export const findExpenseByIdAndDelete = async (expenseID: string) => {
  return await Expense.findOneAndDelete({ _id: expenseID });
};
