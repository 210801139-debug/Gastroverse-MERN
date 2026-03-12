const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurant");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/order");
const reservationRoutes = require("./routes/reservation");

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Core middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
