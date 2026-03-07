import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // - Validate input
  if (!name || !email || !password) {
    return res.status(400).json({message: "All fields are required"});
  }

  // - Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists "});
  }

  // - Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // - Save user
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  // - Return user (without password)
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email
  })
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required"});
  }

  // - Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials"})
  }

  // - Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // - Generate JWT
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // - Return token
  res.status(200).json({ token });
});

export default router;