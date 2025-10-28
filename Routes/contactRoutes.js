import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Contact from "../models/Contact.js";
import { Resend } from "resend";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const contact = await Contact.create({ firstName, lastName, email, phone, message });

    await contact.save();

    const emailResp = await resend.emails.send({
      from: "no-reply@devbuddy.in",      // verified sender
      to: process.env.OWNER_EMAIL,
      reply_to: email, 
      subject: `New Contact Form Submission from ${firstName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    console.log("Email sent successfully", emailResp.id);

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfullyand email sent!",
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
