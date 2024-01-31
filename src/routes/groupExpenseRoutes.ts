import { isValidObjectId } from "mongoose";

import { validateInputs, isNonEmptyNumber } from "../utils/validationInputs";
import router from "./groupRoutes";
import { addExpenseToGroupAndUpdateBalances } from "../controllers/groupExpenseController";

router.route("/").post(
  validateInputs({
    groupId: isValidObjectId,
    payerId: isValidObjectId,
    amout: isNonEmptyNumber,
    involvedMembers: isValidObjectId,
  }),
  addExpenseToGroupAndUpdateBalances
);
export default router;
