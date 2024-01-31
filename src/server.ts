import express from "express";
import passport from "passport";
import session from "express-session";
const mongoose = require("mongoose");
import { setupSwagger } from "./configuration/swaggerSetup";
import "dotenv/config";
import groupRoutes from "./routes/groupRoutes";
import { isLoggedIn } from "./auth/auth";
import loginRoutes from "./routes/loginRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import groupExpenseRoutes from "./routes/groupExpenseRoutes";
require("./auth/config");

const app = express();

app.use(express.json());
setupSwagger(app);

app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", isLoggedIn, (req, res) => {
  res.send("Welcome!!");
});

app.use("/api/groups", groupRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/groupExpense", groupExpenseRoutes);
// Google Auth Route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
