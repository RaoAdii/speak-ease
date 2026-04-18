import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { serializeUser } from "../services/userSerializer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createToken } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    return res
      .status(409)
      .json({ message: "An account with this email already exists." });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "user"
  });

  res.status(201).json({
    token: createToken(user._id.toString()),
    user: serializeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    token: createToken(user._id.toString()),
    user: serializeUser(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    user: serializeUser(req.user)
  });
});
