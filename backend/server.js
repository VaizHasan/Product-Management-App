const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/productRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);

app.use((error, req, res, next) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    const details = error.errors
      ? Object.values(error.errors).map((item) => item.message)
      : [error.message];
    return res.status(400).json({ message: "Invalid product data", errors: details });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body must be valid JSON" });
  }
  console.error(error);
  res.status(500).json({ message: "Server error" });
});

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });