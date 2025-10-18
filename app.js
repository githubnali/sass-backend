import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import contactRoutes from "./Routes/contactRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/contact", contactRoutes);

app.get("/", (req, resp) => resp.send("Backend is running! 🚀"));


const connectDB = async() => {
    await mongoose.connect(process.env.MONGO_URI);
};


connectDB()
  .then(() => {
      console.log("✅ MongoDB connected")
      app.listen(process.env.PORT || 5000, () => {
          console.log(`Server running on port ${process.env.PORT}`)
      })
  }).catch((err) => {
      console.log("❌ MongoDB connection error:", err)
  });