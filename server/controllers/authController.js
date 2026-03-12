const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logSecurityEvent } = require("../utils/securityLogger");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
    algorithm: "HS256",
    issuer: process.env.JWT_ISSUER || "gastroverse-api",
    audience: process.env.JWT_AUDIENCE || "gastroverse-client",
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const safeRole = ["customer", "owner"].includes(role) ? role : "customer";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      logSecurityEvent("duplicate_registration_attempt", req, {
        email: normalizedEmail,
      });
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role: safeRole,
      phone: phone ? String(phone).trim() : undefined,
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password))) {
      logSecurityEvent("failed_login_attempt", req, {
        email: normalizedEmail,
      });

      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
