const mongoose = require("mongoose");
import "dotenv/config";
const PORT = process.env.PORT || 5200;
// import { isLoggedIn } from "./auth/auth";
import app from "./app";
import { isLoggedIn } from "./auth/auth";
require("./auth/config");


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
