const mongoose = require("mongoose");
import "dotenv/config";
const PORT = process.env.PORT || 5200;
// import { isLoggedIn } from "./auth/auth";
import app from "./app";
require("./auth/config");

// app.get("/", isLoggedIn, (req, res) => {
//   res.send("Welcome!!");
// });

// // Google Auth Route
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Successful authentication, redirect home.
//     res.redirect("/");
//   }
// );

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
