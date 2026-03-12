const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

dotenv.config({ path: path.resolve(__dirname, ".env") });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurant");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/order");
const reservationRoutes = require("./routes/reservation");

const app = express();

const validateSecurityConfig = () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  const weakSecret =
    process.env.JWT_SECRET === "your_jwt_secret_here" ||
    process.env.JWT_SECRET.length < 32;

  if (weakSecret && process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET is too weak for production. Use a random secret >= 32 chars",
    );
  }

  if (weakSecret) {
    console.warn(
      "[SECURITY_WARNING] JWT_SECRET appears weak. Replace with random >= 32 chars",
    );
  }
};

validateSecurityConfig();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(apiLimiter);
app.disable("x-powered-by");

// Core middleware
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy blocked this origin"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json({ limit: "10kb" }));

// Protect Swagger docs with basic auth in production
const swaggerAuth = (req, res, next) => {
  // Keep docs open in non-production environments
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const [scheme, encoded] = authHeader.split(" ");

  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="API Docs"');
    return res.status(401).send("Authentication required");
  }

  let decoded;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch (_err) {
    res.set("WWW-Authenticate", 'Basic realm="API Docs"');
    return res.status(401).send("Invalid authentication header");
  }

  const [user, pass] = decoded.split(":");
  const expectedUser = process.env.SWAGGER_USER;
  const expectedPass = process.env.SWAGGER_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return res
      .status(500)
      .send("Swagger credentials are not configured on the server");
  }

  if (user === expectedUser && pass === expectedPass) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="API Docs"');
  return res.status(401).send("Invalid credentials");
};

// Swagger API docs
app.use(
  "/api-docs",
  swaggerAuth,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Gastroverse API Docs",
  }),
);
app.get("/api-docs.json", swaggerAuth, (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  process.exit(1);
});
