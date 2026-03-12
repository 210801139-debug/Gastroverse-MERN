const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

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
    logger.info("POST /api/auth/register called", {
      body: { name: req.body.name, email: req.body.email, role: req.body.role },
    });

    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      logger.error("Register validation failed — missing fields", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (String(password).length < 8) {
      logger.error("Register validation failed — short password");
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
      logger.error("Register failed — duplicate email", {
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

    logger.info("User registered successfully", {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

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
    logger.exception("Register threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    logger.info("POST /api/auth/login called", {
      body: { email: req.body.email },
    });

    const { email, password } = req.body;

    if (!email || !password) {
      logger.error("Login validation failed — missing email or password");
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
      logger.error("Login failed — invalid credentials", {
        email: normalizedEmail,
      });

      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    logger.info("User logged in successfully", {
      userId: user._id,
      email: user.email,
    });

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
    logger.exception("Login threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    logger.info("GET /api/auth/me called", { userId: req.user.id });

    const user = await User.findById(req.user.id);

    logger.info("getMe returned user", { userId: user._id });
    res.json({ success: true, user });
  } catch (error) {
    logger.exception("getMe threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
