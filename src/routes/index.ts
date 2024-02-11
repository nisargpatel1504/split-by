import expenseRoutes from "./expenseRoutes";
import groupExpenseRoutes from "./groupExpenseRoutes";
import groupRoutes from "./groupRoutes";
import loginRoutes from "./loginRoutes";
import userBalanceRoutes from "./userBalanceRoutes";

export const setupRoutes = (app) => {
  app.use("/api/groups", groupRoutes);
  app.use("/api/login", loginRoutes);
  app.use("/api/expenses", expenseRoutes);
  app.use("/api/group-expenses", groupExpenseRoutes);
  app.use("/api/user-balance", userBalanceRoutes);

  // Use other routes...
};
