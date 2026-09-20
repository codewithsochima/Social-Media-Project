const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const followRoutes = require("./routes/followRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", followRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the Social Media API!" });
});

const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((error) => console.error("MongoDB database connection error", error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is currently running and listening on port ${PORT}`);
});

module.exports = app;