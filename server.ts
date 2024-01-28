import express from "express";
import passport from "passport";
import session from "express-session";
const mongoose = require("mongoose");

import "dotenv/config";
import groupRoutes from "./src/routes/groupRoutes";
import { isLoggedIn } from "./src/auth/auth";
import loginRoutes from "./src/routes/loginRoutes";
require("./src/auth/config");

const app = express();

app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", isLoggedIn, (req, res) => {
  res.send("Welcome!!");
});

app.use("/groups", groupRoutes);
app.use("/login", loginRoutes);

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
  .connect(
    "mongodb+srv://nisargpatel1504:M8WbGqSD17ZHcnsz@cluster0.4s6vxzh.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
