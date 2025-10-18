import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// POST /api/contact — create a new contact record
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // Custom input-level validation
    if (!firstName) return res.status(400).json({ error: "First name is required" });
    if (!email) return res.status(400).json({ error: "Email address is required" });

    // Check if email already exists
    const existingUser = await Contact.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "This email is already registered." });
    }

    const contact = new Contact({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    await contact.save();
    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully!",
      data: contact,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: errors });
    }
    console.error("Error saving contact:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
