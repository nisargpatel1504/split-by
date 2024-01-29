import express from "express";
import * as expenseController from "../controllers/expenseController";

const router = express.Router();

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - category
 *               - payer
 *               - participants
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 example: "Dinner at restaurant"
 *               category:
 *                 type: string
 *               payer:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: articipants doesn't exist
 */
router.post("/", expenseController.createExpense);

// Define other routes similarly with Swagger comments

export default router;
