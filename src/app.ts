import express from "express";
import session from "express-session";
import passport from "passport";
import { setupRoutes } from "./routes/index";
import { isLoggedIn } from "./auth/auth";
require("./auth/config");

const app = express();
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());

app.use(passport.session());
app.get("/", isLoggedIn, (req, res) => {
  res.send("Welcome!!");
});

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

setupRoutes(app);

export default app;
