import express from "express";
import session from "express-session";
import passport from "passport";
import { setupRoutes } from "./routes/index";

const app = express();
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());

app.use(passport.session());
setupRoutes(app);

export default app;
