# Gastroverse Backend — Complete Chat Export

**Date:** March 12, 2026
**Repository:** 210801139-debug/Gastroverse-MERN
**Branch:** Backend
**Stack:** Node.js, Express 4.x, MongoDB/Mongoose 8.x, JWT, bcryptjs

---

## Table of Contents

1. [Session Summary](#1-session-summary)
2. [Work Completed](#2-work-completed)
   - [Phase 1 — OWASP Top 10 Hardening](#phase-1--owasp-top-10-hardening)
   - [Phase 2 — Jest Unit Tests](#phase-2--jest-unit-tests)
   - [Phase 3 — Swagger API Documentation](#phase-3--swagger-api-documentation)
   - [Phase 4 — Swagger Usage Guide](#phase-4--swagger-usage-guide)
   - [Phase 5 — Custom Logger System](#phase-5--custom-logger-system)
3. [Project Structure](#3-project-structure)
4. [Dependencies](#4-dependencies)
5. [Complete File Contents](#5-complete-file-contents)
   - [Configuration](#configuration)
   - [Models](#models)
   - [Controllers](#controllers)
   - [Middleware](#middleware)
   - [Routes](#routes)
   - [Utilities](#utilities)
   - [Tests](#tests)
   - [Documentation](#documentation)
6. [Test Results](#6-test-results)
7. [How to Run](#7-how-to-run)

---

## 1. Session Summary

This session covered 5 major phases of backend development for the Gastroverse restaurant management platform:

| #   | Phase                                  | Status      |
| --- | -------------------------------------- | ----------- |
| 1   | OWASP Top 10 Security Hardening        | ✅ Complete |
| 2   | Jest Unit Tests (13 suites, 39 tests)  | ✅ Complete |
| 3   | Swagger API Integration (21 endpoints) | ✅ Complete |
| 4   | Swagger Usage Guide Documentation      | ✅ Complete |
| 5   | Custom Logger System                   | ✅ Complete |

---

## 2. Work Completed

### Phase 1 — OWASP Top 10 Hardening

**Request:** Harden the backend against the OWASP Top 10 vulnerabilities.

**Changes made:**

- **A01 Broken Access Control:** Added `protect` middleware (JWT auth), `authorize` middleware (role-based access control), ownership checks on all owner-only resources, ObjectId validation before DB queries
- **A02 Security Misconfiguration:** Startup validation for `MONGO_URI` and `JWT_SECRET`, weak-secret warnings, `helmet` enabled, `x-powered-by` disabled, CORS allowlist, request body size limit, global API rate limiting
- **A03 Supply Chain:** Dependency lockfile usage, `security:audit` npm script
- **A04 Cryptographic Failures:** bcrypt password hashing (cost 12), JWT with explicit `HS256` algorithm and issuer/audience claims, strong-secret policy
- **A05 Injection:** `express-mongo-sanitize` globally, ObjectId validation, field allowlisting (`pick` helper), Mongoose strict query mode
- **A06 Insecure Design:** Server-side order total calculation, menu item availability checks, future-date reservation validation, party size bounds
- **A07 Authentication Failures:** Auth endpoint rate limiting (10 req/15min), normalized credentials, strict JWT verification
- **A08 Data Integrity Failures:** Server-assigned identity from session (not client payload), controlled status transitions for orders, reservation status allowlist
- **A09 Logging Failures:** Structured security event logging with timestamp, IP, path, method, user agent
- **A10 Exception Handling:** Centralized error handler, error normalization, stack traces hidden in production, process-level handlers for unhandled rejections/exceptions

**Files created:**

- `server/utils/securityLogger.js`
- `server/middleware/errorHandler.js`
- `server/middleware/rateLimiters.js`
- `OWASP top 10.md`

**Files modified:**

- `server/middleware/auth.js` — JWT verification with algorithm/issuer/audience
- `server/middleware/rbac.js` — Role-based access control
- `server/server.js` — Security middleware stack, config validation
- `server/config/db.js` — Strict query mode, fallback handling
- All 5 controllers — ObjectId validation, field allowlisting, ownership checks

---

### Phase 2 — Jest Unit Tests

**Request:** Write unit tests for all backend components.

**Changes made:**

- Created 13 test suites covering controllers, middleware, routes, utils, config, and models.
- 39 total test cases covering validation, authorization, error handling, and happy paths.
- Test helpers for creating mock request/response objects.

**Files created:**

- `server/jest.config.js`
- `server/__tests__/helpers/httpMocks.js`
- `server/__tests__/controllers/authController.test.js` (6 tests)
- `server/__tests__/controllers/restaurantController.test.js` (4 tests)
- `server/__tests__/controllers/menuController.test.js` (3 tests)
- `server/__tests__/controllers/orderController.test.js` (4 tests)
- `server/__tests__/controllers/reservationController.test.js` (4 tests)
- `server/__tests__/middleware/auth.test.js` (3 tests)
- `server/__tests__/middleware/rbac.test.js` (2 tests)
- `server/__tests__/middleware/errorHandler.test.js` (3 tests)
- `server/__tests__/middleware/rateLimiters.test.js` (1 test)
- `server/__tests__/models/userModel.test.js` (2 tests)
- `server/__tests__/routes/routes.test.js` (5 tests)
- `server/__tests__/utils/securityLogger.test.js` (2 tests)
- `server/__tests__/config/db.test.js` (tests for connection logic)

---

### Phase 3 — Swagger API Documentation

**Request:** "Integrate Swagger for API testing."

**Changes made:**

- Installed `swagger-jsdoc` and `swagger-ui-express`
- Created OpenAPI 3.0 spec configuration with 7 schemas (User, Restaurant, MenuItem, Order, Reservation, SuccessResponse, ErrorResponse)
- Added JSDoc OpenAPI annotations to all 5 route files
- Integrated Swagger UI at `/api-docs` with basic auth protection in production
- Raw JSON spec available at `/api-docs.json`
- 21 documented endpoints across 17 paths

**Files created:**

- `server/swagger.js`

**Files modified:**

- `server/routes/auth.js` — Swagger annotations for register, login, getMe
- `server/routes/restaurant.js` — Swagger annotations for all 6 restaurant endpoints
- `server/routes/menu.js` — Swagger annotations for all 4 menu endpoints
- `server/routes/order.js` — Swagger annotations for all 4 order endpoints
- `server/routes/reservation.js` — Swagger annotations for all 4 reservation endpoints
- `server/server.js` — Swagger UI mount + basic auth middleware
- `server/package.json` — Added swagger dependencies

---

### Phase 4 — Swagger Usage Guide

**Request:** "Make a documentation so that I can use the Swagger at ease."

**Changes made:**

- Created a comprehensive step-by-step guide with:
  - Quick start instructions
  - How to register, authorize, and test endpoints
  - Complete endpoint reference tables for all 5 API groups
  - Common workflows for both Customer and Owner roles
  - Troubleshooting guide

**Files created:**

- `server/SWAGGER_GUIDE.md`

---

### Phase 5 — Custom Logger System

**Request:** "I want a separate logger, and there should be a separate file to control the logging parameters, like, there should be an object which has 3 fields, info, error and exception, and each time a log is written it should be like, info.error, should be called and that indicates the log is an error message, then the logging must be done on each and every action, like calling a function, calling an API, while calling an API the log should contain the payload sent while calling the API."

**Changes made:**

- Created a logger config file with boolean toggles for each log level
- Created a logger utility with 3 methods: `logger.info()`, `logger.error()`, `logger.exception()`
- Each log writes JSON to `server/logs/app.log` AND outputs to console
- Integrated logging across ALL 12 backend files:
  - Every function entry is logged with API payload (req.body, req.params, req.user.id)
  - Every validation failure is logged with details
  - Every successful operation is logged with result metadata
  - Every catch block uses `logger.exception()` with error message and stack trace
  - Passwords are NEVER logged (only email/name/role)
- Added `logs/` to `.gitignore`

**Files created:**

- `server/config/loggerConfig.js`
- `server/utils/logger.js`

**Files modified:**

- `server/controllers/authController.js` — ~15 log calls
- `server/controllers/restaurantController.js` — ~20 log calls
- `server/controllers/menuController.js` — ~16 log calls
- `server/controllers/orderController.js` — ~20 log calls
- `server/controllers/reservationController.js` — ~18 log calls
- `server/middleware/auth.js` — Auth flow logging
- `server/middleware/rbac.js` — Role check logging
- `server/middleware/errorHandler.js` — Error handling logging
- `server/server.js` — Startup + process error logging
- `server/config/db.js` — Connection logging
- `.gitignore` — Added `logs/` directory

---

## 3. Project Structure

```
Gastroverse-react/
├── .gitignore
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
├── OWASP top 10.md
├── README.md
└── server/
    ├── package.json
    ├── package-lock.json
    ├── server.js
    ├── swagger.js
    ├── jest.config.js
    ├── SWAGGER_GUIDE.md
    ├── .env
    ├── config/
    │   ├── db.js
    │   └── loggerConfig.js
    ├── controllers/
    │   ├── authController.js
    │   ├── menuController.js
    │   ├── orderController.js
    │   ├── reservationController.js
    │   └── restaurantController.js
    ├── middleware/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   ├── rbac.js
    │   └── rateLimiters.js
    ├── models/
    │   ├── MenuItem.js
    │   ├── Order.js
    │   ├── Reservation.js
    │   ├── Restaurant.js
    │   └── User.js
    ├── routes/
    │   ├── auth.js
    │   ├── menu.js
    │   ├── order.js
    │   ├── reservation.js
    │   └── restaurant.js
    ├── utils/
    │   ├── logger.js
    │   └── securityLogger.js
    ├── logs/          (gitignored, auto-created at runtime)
    │   └── app.log
    └── __tests__/
        ├── helpers/
        │   └── httpMocks.js
        ├── config/
        │   └── db.test.js
        ├── controllers/
        │   ├── authController.test.js
        │   ├── menuController.test.js
        │   ├── orderController.test.js
        │   ├── reservationController.test.js
        │   └── restaurantController.test.js
        ├── middleware/
        │   ├── auth.test.js
        │   ├── errorHandler.test.js
        │   ├── rbac.test.js
        │   └── rateLimiters.test.js
        ├── models/
        │   └── userModel.test.js
        ├── routes/
        │   └── routes.test.js
        └── utils/
            └── securityLogger.test.js
```

---

## 4. Dependencies

### Production

| Package                | Version | Purpose                    |
| ---------------------- | ------- | -------------------------- |
| express                | ^4.21.0 | Web framework              |
| mongoose               | ^8.6.0  | MongoDB ODM                |
| bcryptjs               | ^2.4.3  | Password hashing           |
| jsonwebtoken           | ^9.0.2  | JWT auth tokens            |
| cors                   | ^2.8.5  | Cross-origin requests      |
| helmet                 | ^7.1.0  | HTTP security headers      |
| express-mongo-sanitize | ^2.2.0  | NoSQL injection prevention |
| express-rate-limit     | ^7.4.0  | Rate limiting              |
| dotenv                 | ^16.4.5 | Environment variables      |
| swagger-jsdoc          | ^6.2.8  | OpenAPI spec generation    |
| swagger-ui-express     | ^5.0.1  | Swagger UI serving         |

### Dev

| Package   | Version | Purpose                 |
| --------- | ------- | ----------------------- |
| jest      | ^29.7.0 | Testing framework       |
| supertest | ^7.1.1  | HTTP test assertions    |
| nodemon   | ^3.1.4  | Auto-restart dev server |

---

## 5. Complete File Contents

### Configuration

#### server/package.json

```json
{
  "name": "gastroverse-server",
  "version": "1.0.0",
  "description": "Gastroverse Restaurant Management API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "security:audit": "npm audit --omit=dev",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.6.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.4",
    "supertest": "^7.1.1"
  }
}
```

#### server/jest.config.js

```javascript
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.js"],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "utils/**/*.js",
    "config/**/*.js",
  ],
};
```

#### server/config/loggerConfig.js

```javascript
/**
 * Logger Configuration
 *
 * Controls which log levels are enabled.
 * Set any level to false to suppress those messages.
 */
module.exports = {
  info: true,
  error: true,
  exception: true,
};
```

#### server/config/db.js

```javascript
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("../utils/logger");

// Support .env in either server/.env or project-root/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  try {
    if (!primaryUri) {
      throw new Error(
        "MONGO_URI is not set. Add it to server/.env or project-root/.env",
      );
    }

    mongoose.set("strictQuery", true);

//     strictQuery in Mongoose controls whether Mongoose filters out query conditions that aren't defined in the schema.

// strictQuery: true — Mongoose silently strips any filter fields from queries (.find(), .findOne(), etc.) that don't exist in the schema. This prevents accidental or malicious NoSQL injection via unknown fields.

// strictQuery: false (Mongoose 7+ default) — Mongoose allows filtering by arbitrary fields, even if they're not in the schema. This can be a security risk if user input flows into query filters.

    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If running locally, Docker DNS name "mongo" is not resolvable.
    if (error.code === "ENOTFOUND" && primaryUri.includes("://mongo:")) {
      const fallbackUri = primaryUri.replace("://mongo:", "://localhost:");

      try {
        mongoose.set("strictQuery", true);

        const conn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 8000,
        });
        logger.info(
          `MongoDB connected via localhost fallback: ${conn.connection.host}`,
        );
        return;
      } catch (fallbackError) {
        logger.error(
          `MongoDB fallback connection error: ${fallbackError.message}`,
        );
      }
    }

    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### server/server.js

```javascript
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
const logger = require("./utils/logger");


// Helmet
// helmet sets various HTTP security headers on every response to protect against common web vulnerabilities:

// Header	Protection
// Content-Security-Policy	Prevents XSS and data injection
// X-Content-Type-Options: nosniff	Stops browsers from MIME-sniffing
// X-Frame-Options: SAMEORIGIN	Blocks clickjacking via iframes
// Strict-Transport-Security	Forces HTTPS connections
// X-XSS-Protection	Legacy XSS filter hint
// X-DNS-Prefetch-Control	Controls DNS prefetching
// + several more	Various attack surface reductions
// Without it, Express sends no security headers by default, leaving the app exposed.
// app.use(helmet()); 
// express-mongo-sanitize
// mongoSanitize prevents NoSQL injection attacks by stripping out MongoDB query operators ($gt, $ne, $where, etc.) from user input (req.body, req.query, req.params).
// app.use(mongoSanitize());

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
    logger.error(
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
app.use(express.json({ limit: "16mb" }));

// Protect Swagger docs with basic auth in production
const swaggerAuth = (req, res, next) => {
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
    logger.info(`Server running on port ${PORT}`);
  });
});

process.on("unhandledRejection", (reason) => {
  logger.exception("Unhandled Rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.exception("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
```

#### server/swagger.js

```javascript
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gastroverse Restaurant Management API",
      version: "1.0.0",
      description:
        "REST API for Gastroverse — a restaurant management platform supporting authentication, restaurant CRUD, menu management, ordering, and reservations.",
      contact: {
        name: "Gastroverse Team",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["customer", "owner"],
              example: "customer",
            },
            phone: { type: "string", example: "+1234567890" },
          },
        },
        Restaurant: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "The Great Kitchen" },
            description: {
              type: "string",
              example: "A fine-dining experience",
            },
            cuisine: {
              type: "array",
              items: { type: "string" },
              example: ["Italian", "French"],
            },
            address: {
              type: "object",
              properties: {
                street: { type: "string", example: "123 Main St" },
                city: { type: "string", example: "New York" },
                state: { type: "string", example: "NY" },
                zipCode: { type: "string", example: "10001" },
              },
            },
            phone: { type: "string", example: "+1234567890" },
            owner: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            image: { type: "string", example: "https://example.com/image.jpg" },
            rating: { type: "number", minimum: 0, maximum: 5, example: 4.5 },
            isOpen: { type: "boolean", example: true },
          },
        },
        MenuItem: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            name: { type: "string", example: "Margherita Pizza" },
            description: {
              type: "string",
              example: "Classic pizza with tomato and mozzarella",
            },
            price: { type: "number", minimum: 0, example: 12.99 },
            category: {
              type: "string",
              enum: ["appetizer", "main", "dessert", "beverage", "side"],
              example: "main",
            },
            image: { type: "string", example: "https://example.com/pizza.jpg" },
            restaurant: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            isAvailable: { type: "boolean", example: true },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            customer: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            restaurant: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  menuItem: {
                    type: "string",
                    example: "665a1b2c3d4e5f6a7b8c9d0e",
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    maximum: 20,
                    example: 2,
                  },
                  price: { type: "number", example: 12.99 },
                },
              },
            },
            totalAmount: { type: "number", example: 25.98 },
            status: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "delivered",
                "cancelled",
              ],
              example: "pending",
            },
            notes: { type: "string", example: "No onions please" },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            customer: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            restaurant: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-04-15T00:00:00.000Z",
            },
            time: { type: "string", example: "19:00" },
            partySize: { type: "integer", minimum: 1, maximum: 20, example: 4 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "completed"],
              example: "pending",
            },
            notes: { type: "string", example: "Window seat preferred" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
```

#### .gitignore

```
# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Environment
.env
.env.local
.env.*.local

# Build
client/dist/
server/dist/

# Logs
logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml
```

---

### Models

#### server/models/User.js

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "owner"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

#### server/models/Restaurant.js

```javascript
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    cuisine: {
      type: [String],
      default: [],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    phone: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
```

#### server/models/MenuItem.js

```javascript
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    category: {
      type: String,
      enum: ["appetizer", "main", "dessert", "beverage", "side"],
      required: true,
    },
    image: String,
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
```

#### server/models/Order.js

```javascript
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
```

#### server/models/Reservation.js

```javascript
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Reservation date is required"],
    },
    time: {
      type: String,
      required: [true, "Reservation time is required"],
    },
    partySize: {
      type: Number,
      required: [true, "Party size is required"],
      min: 1,
      max: 20,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);
```

---

### Controllers

#### server/controllers/authController.js

```javascript
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
```

#### server/controllers/restaurantController.js

```javascript
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const logger = require("../utils/logger");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const pick = (source, allowed) =>
  allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

exports.getRestaurants = async (req, res, next) => {
  try {
    logger.info("GET /api/restaurants called");

    const restaurants = await Restaurant.find({ isOpen: true }).populate(
      "owner",
      "name email",
    );

    logger.info("getRestaurants returned results", {
      count: restaurants.length,
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    logger.exception("getRestaurants threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    logger.info("GET /api/restaurants/:id called", { params: req.params });

    if (!isValidObjectId(req.params.id)) {
      logger.error("getRestaurant — invalid ID", { id: req.params.id });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!restaurant) {
      logger.error("getRestaurant — not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    logger.info("getRestaurant returned result", {
      restaurantId: restaurant._id,
    });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    logger.exception("getRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    logger.info("POST /api/restaurants called", {
      body: req.body,
      userId: req.user.id,
    });

    const allowedFields = [
      "name",
      "description",
      "cuisine",
      "address",
      "phone",
      "image",
      "isOpen",
    ];
    const payload = pick(req.body, allowedFields);
    payload.owner = req.user.id;

    const restaurant = await Restaurant.create(payload);

    logger.info("Restaurant created", {
      restaurantId: restaurant._id,
      name: restaurant.name,
    });
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    logger.exception("createRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    logger.info("PUT /api/restaurants/:id called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateRestaurant — invalid ID", { id: req.params.id });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      logger.error("updateRestaurant — not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("updateRestaurant — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const allowedFields = [
      "name",
      "description",
      "cuisine",
      "address",
      "phone",
      "image",
      "isOpen",
    ];
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      pick(req.body, allowedFields),
      {
        new: true,
        runValidators: true,
      },
    );

    logger.info("Restaurant updated", { restaurantId: updated._id });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.exception("updateRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    logger.info("DELETE /api/restaurants/:id called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("deleteRestaurant — invalid ID", { id: req.params.id });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      logger.error("deleteRestaurant — not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("deleteRestaurant — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await restaurant.deleteOne();

    logger.info("Restaurant deleted", { restaurantId: req.params.id });
    res.json({ success: true, message: "Restaurant deleted" });
  } catch (error) {
    logger.exception("deleteRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMyRestaurants = async (req, res, next) => {
  try {
    logger.info("GET /api/restaurants/my called", { userId: req.user.id });

    const restaurants = await Restaurant.find({ owner: req.user.id });

    logger.info("getMyRestaurants returned results", {
      count: restaurants.length,
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    logger.exception("getMyRestaurants threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
```

#### server/controllers/menuController.js

```javascript
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const logger = require("../utils/logger");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const pick = (source, allowed) =>
  allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

exports.getMenuByRestaurant = async (req, res, next) => {
  try {
    logger.info("GET /api/menu/:restaurantId called", { params: req.params });

    if (!isValidObjectId(req.params.restaurantId)) {
      logger.error("getMenuByRestaurant — invalid restaurant ID", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    });

    logger.info("getMenuByRestaurant returned results", {
      restaurantId: req.params.restaurantId,
      count: items.length,
    });
    res.json({ success: true, data: items });
  } catch (error) {
    logger.exception("getMenuByRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    logger.info("POST /api/menu called", {
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.body.restaurant)) {
      logger.error("createMenuItem — invalid restaurant ID", {
        restaurant: req.body.restaurant,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      logger.error("createMenuItem — restaurant not found", {
        restaurant: req.body.restaurant,
      });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("createMenuItem — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "restaurant",
      "isAvailable",
    ];
    const item = await MenuItem.create(pick(req.body, allowedFields));

    logger.info("Menu item created", {
      menuItemId: item._id,
      name: item.name,
      restaurant: item.restaurant,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    logger.exception("createMenuItem threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    logger.info("PUT /api/menu/:id called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateMenuItem — invalid menu item ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id).populate("restaurant");
    if (!item) {
      logger.error("updateMenuItem — item not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    if (item.restaurant.owner.toString() !== req.user.id) {
      logger.error("updateMenuItem — not authorized", {
        ownerId: item.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "isAvailable",
    ];
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      pick(req.body, allowedFields),
      {
        new: true,
        runValidators: true,
      },
    );

    logger.info("Menu item updated", { menuItemId: updated._id });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.exception("updateMenuItem threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    logger.info("DELETE /api/menu/:id called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("deleteMenuItem — invalid menu item ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id).populate("restaurant");
    if (!item) {
      logger.error("deleteMenuItem — item not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    if (item.restaurant.owner.toString() !== req.user.id) {
      logger.error("deleteMenuItem — not authorized", {
        ownerId: item.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await item.deleteOne();

    logger.info("Menu item deleted", { menuItemId: req.params.id });
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    logger.exception("deleteMenuItem threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
```

#### server/controllers/orderController.js

```javascript
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const logger = require("../utils/logger");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validStatusTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["delivered"],
  delivered: [],
  cancelled: [],
};

exports.createOrder = async (req, res, next) => {
  try {
    logger.info("POST /api/orders called", {
      body: req.body,
      userId: req.user?.id,
    });

    const { restaurant, items, notes } = req.body;

    if (!isValidObjectId(restaurant)) {
      logger.error("createOrder — invalid restaurant ID", { restaurant });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      logger.error("createOrder — empty or missing items");
      return res.status(400).json({
        success: false,
        message: "Order must include at least one item",
      });
    }

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      logger.error("createOrder — restaurant not found", { restaurant });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    if (!restaurantDoc.isOpen) {
      logger.error("createOrder — restaurant is closed", { restaurant });
      return res.status(400).json({
        success: false,
        message: "Cannot place order: restaurant is currently closed",
      });
    }

    const menuItemIds = items.map((item) => item.menuItem);
    if (!menuItemIds.every((id) => isValidObjectId(id))) {
      logger.error("createOrder — invalid menu item ID in order", {
        menuItemIds,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id in order" });
    }

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurant,
      isAvailable: true,
    });

    if (menuItems.length !== menuItemIds.length) {
      logger.error("createOrder — some items invalid or unavailable", {
        expected: menuItemIds.length,
        found: menuItems.length,
      });
      return res.status(400).json({
        success: false,
        message: "One or more items are invalid or unavailable",
      });
    }

    const menuById = new Map(menuItems.map((item) => [String(item._id), item]));
    const normalizedItems = items.map((item) => {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        throw new Error(
          "Each item quantity must be an integer between 1 and 20",
        );
      }

      const menuItem = menuById.get(String(item.menuItem));
      return {
        menuItem: menuItem._id,
        quantity: qty,
        price: menuItem.price,
      };
    });

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      customer: req.user.id,
      restaurant,
      items: normalizedItems,
      totalAmount,
      status: "pending",
      notes: notes ? String(notes).trim().slice(0, 500) : undefined,
    });

    logger.info("Order created", {
      orderId: order._id,
      restaurant,
      totalAmount,
      itemCount: normalizedItems.length,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (error.message.includes("quantity")) {
      logger.error("createOrder — quantity validation error", {
        error: error.message,
      });
      return res.status(400).json({ success: false, message: error.message });
    }
    logger.exception("createOrder threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    logger.info("GET /api/orders/my called", { userId: req.user.id });

    const orders = await Order.find({ customer: req.user.id })
      .populate("restaurant", "name")
      .populate("items.menuItem", "name price")
      .sort("-createdAt");

    logger.info("getMyOrders returned results", { count: orders.length });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.exception("getMyOrders threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getRestaurantOrders = async (req, res, next) => {
  try {
    logger.info("GET /api/orders/restaurant/:restaurantId called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.restaurantId)) {
      logger.error("getRestaurantOrders — invalid restaurant ID", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      logger.error("getRestaurantOrders — restaurant not found", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("getRestaurantOrders — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate("customer", "name email phone")
      .populate("items.menuItem", "name price")
      .sort("-createdAt");

    logger.info("getRestaurantOrders returned results", {
      restaurantId: req.params.restaurantId,
      count: orders.length,
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.exception("getRestaurantOrders threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    logger.info("PATCH /api/orders/:id/status called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateOrderStatus — invalid order ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    const nextStatus = String(req.body.status || "").trim();
    if (!nextStatus) {
      logger.error("updateOrderStatus — missing status field");
      return res
        .status(400)
        .json({ success: false, message: "status is required" });
    }

    const order = await Order.findById(req.params.id).populate("restaurant");
    if (!order) {
      logger.error("updateOrderStatus — order not found", {
        id: req.params.id,
      });
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.restaurant.owner.toString() !== req.user.id) {
      logger.error("updateOrderStatus — not authorized", {
        ownerId: order.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const allowedTransitions = validStatusTransitions[order.status] || [];
    if (!allowedTransitions.includes(nextStatus)) {
      logger.error("updateOrderStatus — invalid transition", {
        from: order.status,
        to: nextStatus,
      });
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${nextStatus}`,
      });
    }

    order.status = nextStatus;
    await order.save();

    logger.info("Order status updated", {
      orderId: order._id,
      from: order.status,
      to: nextStatus,
    });
    res.json({ success: true, data: order });
  } catch (error) {
    logger.exception("updateOrderStatus threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
```

#### server/controllers/reservationController.js

```javascript
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");
const logger = require("../utils/logger");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const allowedReservationStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

exports.createReservation = async (req, res, next) => {
  try {
    logger.info("POST /api/reservations called", {
      body: req.body,
      userId: req.user?.id,
    });

    const { restaurant, date, time, partySize, notes } = req.body;

    if (!isValidObjectId(restaurant)) {
      logger.error("createReservation — invalid restaurant ID", { restaurant });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      logger.error("createReservation — restaurant not found", { restaurant });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    if (!restaurantDoc.isOpen) {
      logger.error("createReservation — restaurant is closed", { restaurant });
      return res.status(400).json({
        success: false,
        message: "Cannot reserve: restaurant is currently closed",
      });
    }

    const reservationDate = new Date(date);
    if (
      Number.isNaN(reservationDate.getTime()) ||
      reservationDate <= new Date()
    ) {
      logger.error("createReservation — invalid or past date", { date });
      return res.status(400).json({
        success: false,
        message: "Reservation date must be a valid future date",
      });
    }

    const parsedPartySize = Number(partySize);
    if (
      !Number.isInteger(parsedPartySize) ||
      parsedPartySize < 1 ||
      parsedPartySize > 20
    ) {
      logger.error("createReservation — invalid party size", { partySize });
      return res.status(400).json({
        success: false,
        message: "Party size must be an integer between 1 and 20",
      });
    }

    const reservation = await Reservation.create({
      customer: req.user.id,
      restaurant,
      date: reservationDate,
      time: String(time || "").trim(),
      partySize: parsedPartySize,
      status: "pending",
      notes: notes ? String(notes).trim().slice(0, 500) : undefined,
    });

    logger.info("Reservation created", {
      reservationId: reservation._id,
      restaurant,
      date: reservationDate,
      partySize: parsedPartySize,
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    logger.exception("createReservation threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    logger.info("GET /api/reservations/my called", { userId: req.user.id });

    const reservations = await Reservation.find({ customer: req.user.id })
      .populate("restaurant", "name address")
      .sort("-date");

    logger.info("getMyReservations returned results", {
      count: reservations.length,
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    logger.exception("getMyReservations threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getRestaurantReservations = async (req, res, next) => {
  try {
    logger.info("GET /api/reservations/restaurant/:restaurantId called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.restaurantId)) {
      logger.error("getRestaurantReservations — invalid restaurant ID", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      logger.error("getRestaurantReservations — restaurant not found", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("getRestaurantReservations — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const reservations = await Reservation.find({
      restaurant: req.params.restaurantId,
    })
      .populate("customer", "name email phone")
      .sort("-date");

    logger.info("getRestaurantReservations returned results", {
      restaurantId: req.params.restaurantId,
      count: reservations.length,
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    logger.exception("getRestaurantReservations threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    logger.info("PATCH /api/reservations/:id/status called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateReservationStatus — invalid reservation ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation id" });
    }

    const status = String(req.body.status || "").trim();
    if (!allowedReservationStatuses.includes(status)) {
      logger.error("updateReservationStatus — invalid status value", {
        status,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const reservation = await Reservation.findById(req.params.id).populate(
      "restaurant",
    );
    if (!reservation) {
      logger.error("updateReservationStatus — reservation not found", {
        id: req.params.id,
      });
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    if (reservation.restaurant.owner.toString() !== req.user.id) {
      logger.error("updateReservationStatus — not authorized", {
        ownerId: reservation.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const previousStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    logger.info("Reservation status updated", {
      reservationId: reservation._id,
      from: previousStatus,
      to: status,
    });
    res.json({ success: true, data: reservation });
  } catch (error) {
    logger.exception("updateReservationStatus threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
```

---

### Middleware

#### server/middleware/auth.js

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

const protect = async (req, res, next) => {
  try {
    logger.info("Auth middleware called", {
      method: req.method,
      url: req.originalUrl,
    });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.error("Auth — missing or invalid authorization header", {
        authHeader: authHeader ? "present but malformed" : "missing",
      });
      logSecurityEvent("missing_or_invalid_auth_header", req);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER || "gastroverse-api",
      audience: process.env.JWT_AUDIENCE || "gastroverse-client",
    });
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.error("Auth — user not found for decoded token", {
        decodedId: decoded.id,
      });
      logSecurityEvent("auth_user_not_found", req);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    logger.info("Auth — user authenticated", {
      userId: user._id,
      role: user.role,
    });
    req.user = user;
    next();
  } catch (error) {
    logger.exception("Auth middleware threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    logSecurityEvent("token_verification_failed", req, {
      errorName: error.name,
    });
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

module.exports = protect;
```

#### server/middleware/rbac.js

```javascript
const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

const authorize = (...roles) => {
  return (req, res, next) => {
    logger.info("RBAC middleware called", {
      allowedRoles: roles,
      userRole: req.user ? req.user.role : null,
    });

    if (!req.user || !roles.includes(req.user.role)) {
      logger.error("RBAC — access denied", {
        allowedRoles: roles,
        userRole: req.user ? req.user.role : null,
      });
      logSecurityEvent("forbidden_action", req, {
        allowedRoles: roles,
        userRole: req.user ? req.user.role : null,
      });

      return res.status(403).json({
        success: false,
        message: "Not authorized for this action",
      });
    }

    logger.info("RBAC — access granted", { role: req.user.role });
    next();
  };
};

module.exports = authorize;
```

#### server/middleware/errorHandler.js

```javascript
const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

const notFound = (req, res) => {
  logger.error("Route not found", { method: req.method, url: req.originalUrl });
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, _next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized";
  }

  if (statusCode >= 500) {
    logger.exception("Server error handled", {
      statusCode,
      errorName: err.name,
      message: err.message,
      stack: err.stack,
    });
    logSecurityEvent("server_error", req, {
      statusCode,
      errorName: err.name,
    });
  } else {
    logger.error("Client error handled", {
      statusCode,
      errorName: err.name,
      message,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
```

#### server/middleware/rateLimiters.js

```javascript
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
});

module.exports = { apiLimiter, authLimiter };
```

---

### Utilities

#### server/utils/logger.js

```javascript
const fs = require("fs");
const path = require("path");
const loggerConfig = require("../config/loggerConfig");

const logDir = path.resolve(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, "app.log");

const formatTimestamp = () => new Date().toISOString();

const writeToFile = (entry) => {
  const line = JSON.stringify(entry) + "\n";
  fs.appendFile(logFilePath, line, (err) => {
    if (err) console.error("Failed to write log:", err.message);
  });
};

const buildEntry = (level, message, data) => ({
  timestamp: formatTimestamp(),
  level,
  message,
  ...(data !== undefined && { data }),
});

const logger = {
  /**
   * Log an informational message.
   * Usage: logger.info("Server started", { port: 5000 })
   */
  info: (message, data) => {
    if (!loggerConfig.info) return;
    const entry = buildEntry("INFO", message, data);
    console.log(
      `[${entry.timestamp}] [INFO] ${message}`,
      data !== undefined ? data : "",
    );
    writeToFile(entry);
  },

  /**
   * Log an error message.
   * Usage: logger.error("DB connection failed", { error: err.message })
   */
  error: (message, data) => {
    if (!loggerConfig.error) return;
    const entry = buildEntry("ERROR", message, data);
    console.error(
      `[${entry.timestamp}] [ERROR] ${message}`,
      data !== undefined ? data : "",
    );
    writeToFile(entry);
  },

  /**
   * Log an exception (unhandled / unexpected errors).
   * Usage: logger.exception("Uncaught exception", { stack: err.stack })
   */
  exception: (message, data) => {
    if (!loggerConfig.exception) return;
    const entry = buildEntry("EXCEPTION", message, data);
    console.error(
      `[${entry.timestamp}] [EXCEPTION] ${message}`,
      data !== undefined ? data : "",
    );
    writeToFile(entry);
  },
};

module.exports = logger;
```

#### server/utils/securityLogger.js

```javascript
const logSecurityEvent = (event, req, details = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get("user-agent"),
    userId: req.user ? req.user.id || req.user._id : null,
    ...details,
  };

  console.warn("[SECURITY_EVENT]", JSON.stringify(payload));
};

module.exports = { logSecurityEvent };
```

---

### Tests

#### server/**tests**/helpers/httpMocks.js

```javascript
const createMockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockReq = (overrides = {}) => ({
  body: {},
  params: {},
  headers: {},
  user: null,
  ip: "127.0.0.1",
  method: "GET",
  originalUrl: "/test",
  get: jest.fn().mockReturnValue("jest-agent"),
  ...overrides,
});

module.exports = {
  createMockReq,
  createMockRes,
};
```

#### server/**tests**/controllers/authController.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("../../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-token"),
}));

jest.mock("../../utils/securityLogger", () => ({
  logSecurityEvent: jest.fn(),
}));

const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { logSecurityEvent } = require("../../utils/securityLogger");
const { register, login, getMe } = require("../../controllers/authController");

describe("authController", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "x".repeat(40);
  });

  test("register returns 400 for missing fields", async () => {
    const req = createMockReq({ body: { email: "a@b.com" } });
    const res = createMockRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("register returns 400 when email already exists", async () => {
    User.findOne.mockResolvedValue({ _id: "u1" });
    const req = createMockReq({
      body: { name: "A", email: "A@B.COM", password: "password123" },
    });
    const res = createMockRes();

    await register(req, res, jest.fn());

    expect(logSecurityEvent).toHaveBeenCalledWith(
      "duplicate_registration_attempt",
      req,
      expect.objectContaining({ email: "a@b.com" }),
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("register creates user and returns token", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "u1",
      name: "Alice",
      email: "alice@example.com",
      role: "customer",
    });

    const req = createMockReq({
      body: {
        name: "  Alice  ",
        email: "ALICE@EXAMPLE.COM",
        password: "password123",
        role: "invalid",
      },
    });
    const res = createMockRes();

    await register(req, res, jest.fn());

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Alice",
        email: "alice@example.com",
        role: "customer",
      }),
    );
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("login returns 401 for invalid credentials", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = createMockReq({
      body: { email: "alice@example.com", password: "bad" },
    });
    const res = createMockRes();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(logSecurityEvent).toHaveBeenCalledWith(
      "failed_login_attempt",
      req,
      expect.any(Object),
    );
  });

  test("login returns success for valid credentials", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: "owner",
        comparePassword: jest.fn().mockResolvedValue(true),
      }),
    });

    const req = createMockReq({
      body: { email: "alice@example.com", password: "password123" },
    });
    const res = createMockRes();

    await login(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: "mock-token" }),
    );
  });

  test("getMe returns current user", async () => {
    User.findById.mockResolvedValue({ _id: "u1" });
    const req = createMockReq({ user: { id: "u1" } });
    const res = createMockRes();

    await getMe(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: { _id: "u1" },
    });
  });
});
```

#### server/**tests**/controllers/restaurantController.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/Restaurant", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const mongoose = require("mongoose");
const Restaurant = require("../../models/Restaurant");
const controller = require("../../controllers/restaurantController");

describe("restaurantController", () => {
  test("getRestaurant returns 400 for invalid id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ params: { id: "bad" } });
    const res = createMockRes();

    await controller.getRestaurant(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createRestaurant assigns owner and filters fields", async () => {
    Restaurant.create.mockResolvedValue({ _id: "r1" });
    const req = createMockReq({
      user: { id: "owner-1" },
      body: { name: "R", owner: "bad", random: "ignore" },
    });
    const res = createMockRes();

    await controller.createRestaurant(req, res, jest.fn());

    expect(Restaurant.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "R", owner: "owner-1" }),
    );
    expect(Restaurant.create.mock.calls[0][0].random).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("updateRestaurant returns 403 for non-owner", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ owner: { toString: () => "x" } });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "owner-1" },
      body: { name: "New" },
    });
    const res = createMockRes();

    await controller.updateRestaurant(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("deleteRestaurant calls deleteOne for owner", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const deleteOne = jest.fn().mockResolvedValue(undefined);
    Restaurant.findById.mockResolvedValue({
      owner: { toString: () => "owner-1" },
      deleteOne,
    });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "owner-1" },
    });
    const res = createMockRes();

    await controller.deleteRestaurant(req, res, jest.fn());

    expect(deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
```

#### server/**tests**/controllers/menuController.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/MenuItem", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../models/Restaurant", () => ({
  findById: jest.fn(),
}));

const mongoose = require("mongoose");
const MenuItem = require("../../models/MenuItem");
const Restaurant = require("../../models/Restaurant");
const controller = require("../../controllers/menuController");

describe("menuController", () => {
  test("getMenuByRestaurant returns 400 for invalid id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ params: { restaurantId: "bad" } });
    const res = createMockRes();

    await controller.getMenuByRestaurant(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createMenuItem returns 403 for non-owner", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ owner: { toString: () => "o2" } });

    const req = createMockReq({
      user: { id: "o1" },
      body: { restaurant: "507f191e810c19729de860ea" },
    });
    const res = createMockRes();

    await controller.createMenuItem(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("updateMenuItem filters payload fields", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    MenuItem.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        restaurant: { owner: { toString: () => "o1" } },
      }),
    });
    MenuItem.findByIdAndUpdate.mockResolvedValue({ _id: "m1" });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "o1" },
      body: { name: "Soup", random: "ignored" },
    });
    const res = createMockRes();

    await controller.updateMenuItem(req, res, jest.fn());

    expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      expect.objectContaining({ name: "Soup" }),
      expect.any(Object),
    );
    expect(MenuItem.findByIdAndUpdate.mock.calls[0][1].random).toBeUndefined();
  });
});
```

#### server/**tests**/controllers/orderController.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/Order", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../models/Restaurant", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/MenuItem", () => ({
  find: jest.fn(),
}));

const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Restaurant = require("../../models/Restaurant");
const MenuItem = require("../../models/MenuItem");
const controller = require("../../controllers/orderController");

describe("orderController", () => {
  test("createOrder returns 400 for invalid restaurant id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ body: { restaurant: "bad", items: [] } });
    const res = createMockRes();

    await controller.createOrder(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOrder computes totalAmount from DB prices", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ isOpen: true });
    MenuItem.find.mockResolvedValue([
      { _id: "m1", price: 100 },
      { _id: "m2", price: 50 },
    ]);
    Order.create.mockResolvedValue({
      _id: "ord1",
      restaurant: "507f191e810c19729de860ea",
      totalAmount: 350,
    });

    const req = createMockReq({
      user: { id: "c1" },
      body: {
        restaurant: "507f191e810c19729de860ea",
        items: [
          { menuItem: "m1", quantity: 3 },
          { menuItem: "m2", quantity: 1 },
        ],
      },
    });
    const res = createMockRes();

    await controller.createOrder(req, res, jest.fn());

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 350 }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("updateOrderStatus rejects invalid transitions", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        status: "pending",
        restaurant: { owner: { toString: () => "o1" } },
        save: jest.fn(),
      }),
    });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "o1" },
      body: { status: "delivered" },
    });
    const res = createMockRes();

    await controller.updateOrderStatus(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateOrderStatus saves valid transition", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const save = jest.fn().mockResolvedValue(undefined);
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "ord1",
        status: "pending",
        restaurant: { owner: { toString: () => "o1" } },
        save,
      }),
    });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "o1" },
      body: { status: "confirmed" },
    });
    const res = createMockRes();

    await controller.updateOrderStatus(req, res, jest.fn());

    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
```

#### server/**tests**/controllers/reservationController.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/Reservation", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../models/Restaurant", () => ({
  findById: jest.fn(),
}));

const mongoose = require("mongoose");
const Reservation = require("../../models/Reservation");
const Restaurant = require("../../models/Restaurant");
const controller = require("../../controllers/reservationController");

describe("reservationController", () => {
  test("createReservation returns 400 for invalid restaurant id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ body: { restaurant: "bad" } });
    const res = createMockRes();

    await controller.createReservation(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createReservation returns 400 for past date", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ isOpen: true });

    const req = createMockReq({
      user: { id: "c1" },
      body: {
        restaurant: "507f191e810c19729de860ea",
        date: "2000-01-01",
        time: "12:00",
        partySize: 2,
      },
    });
    const res = createMockRes();

    await controller.createReservation(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createReservation succeeds with valid data", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ isOpen: true });

    const futureDate = new Date(Date.now() + 86400000).toISOString();

    Reservation.create.mockResolvedValue({
      _id: "res1",
      customer: "c1",
      restaurant: "507f191e810c19729de860ea",
      date: futureDate,
      time: "13:00",
      partySize: 4,
      status: "pending",
    });

    const req = createMockReq({
      user: { id: "c1" },
      body: {
        restaurant: "507f191e810c19729de860ea",
        date: futureDate,
        time: "13:00",
        partySize: 4,
      },
    });
    const res = createMockRes();

    await controller.createReservation(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("updateReservationStatus rejects invalid status", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "o1" },
      body: { status: "unknown" },
    });
    const res = createMockRes();

    await controller.updateReservationStatus(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

#### server/**tests**/middleware/auth.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../models/User", () => ({
  findById: jest.fn(),
}));

jest.mock("../../utils/securityLogger", () => ({
  logSecurityEvent: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { logSecurityEvent } = require("../../utils/securityLogger");
const protect = require("../../middleware/auth");

describe("auth middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "x".repeat(40);
  });

  test("returns 401 for missing bearer token", async () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();

    await protect(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(logSecurityEvent).toHaveBeenCalledWith(
      "missing_or_invalid_auth_header",
      req,
    );
  });

  test("returns 401 when user not found", async () => {
    jwt.verify.mockReturnValue({ id: "u1" });
    User.findById.mockResolvedValue(null);

    const req = createMockReq({
      headers: { authorization: "Bearer token" },
    });
    const res = createMockRes();

    await protect(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("sets req.user and calls next for valid token", async () => {
    jwt.verify.mockReturnValue({ id: "u1" });
    User.findById.mockResolvedValue({ _id: "u1", role: "customer" });

    const req = createMockReq({
      headers: { authorization: "Bearer token" },
    });
    const res = createMockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(req.user).toEqual(expect.objectContaining({ _id: "u1" }));
    expect(next).toHaveBeenCalled();
  });
});
```

#### server/**tests**/middleware/rbac.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("../../utils/securityLogger", () => ({
  logSecurityEvent: jest.fn(),
}));

const { logSecurityEvent } = require("../../utils/securityLogger");
const authorize = require("../../middleware/rbac");

describe("rbac middleware", () => {
  test("blocks unauthorized roles", () => {
    const req = createMockReq({ user: { role: "customer" } });
    const res = createMockRes();
    const next = jest.fn();

    authorize("owner")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(logSecurityEvent).toHaveBeenCalledWith(
      "forbidden_action",
      req,
      expect.any(Object),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("allows valid roles", () => {
    const req = createMockReq({ user: { role: "owner" } });
    const res = createMockRes();
    const next = jest.fn();

    authorize("owner")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
```

#### server/**tests**/middleware/errorHandler.test.js

```javascript
const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("../../utils/securityLogger", () => ({
  logSecurityEvent: jest.fn(),
}));

const { logSecurityEvent } = require("../../utils/securityLogger");
const { notFound, errorHandler } = require("../../middleware/errorHandler");

describe("errorHandler middleware", () => {
  test("notFound returns 404", () => {
    const req = createMockReq({ originalUrl: "/unknown" });
    const res = createMockRes();

    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("maps CastError to 400", () => {
    const req = createMockReq();
    const res = createMockRes();
    const err = { name: "CastError", message: "bad" };

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid resource identifier" }),
    );
  });

  test("logs server error for 500", () => {
    const req = createMockReq();
    const res = createMockRes();
    const err = { name: "Error", message: "boom" };

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(logSecurityEvent).toHaveBeenCalledWith(
      "server_error",
      req,
      expect.any(Object),
    );
  });
});
```

#### server/**tests**/middleware/rateLimiters.test.js

```javascript
const { apiLimiter, authLimiter } = require("../../middleware/rateLimiters");

describe("rateLimiters", () => {
  test("exports apiLimiter and authLimiter", () => {
    expect(typeof apiLimiter).toBe("function");
    expect(typeof authLimiter).toBe("function");
  });
});
```

#### server/**tests**/models/userModel.test.js

```javascript
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

describe("User model", () => {
  test("has expected required schema fields", () => {
    expect(User.schema.path("name")).toBeDefined();
    expect(User.schema.path("email")).toBeDefined();
    expect(User.schema.path("password")).toBeDefined();
    expect(User.schema.path("role")).toBeDefined();
  });

  test("comparePassword uses bcrypt.compare", async () => {
    const compareSpy = jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

    const user = new User({
      name: "A",
      email: "a@example.com",
      password: "hashed",
      role: "customer",
    });

    const result = await user.comparePassword("plain-pass");

    expect(compareSpy).toHaveBeenCalledWith("plain-pass", "hashed");
    expect(result).toBe(true);

    compareSpy.mockRestore();
  });
});
```

#### server/**tests**/routes/routes.test.js

```javascript
const authRoutes = require("../../routes/auth");
const restaurantRoutes = require("../../routes/restaurant");
const menuRoutes = require("../../routes/menu");
const orderRoutes = require("../../routes/order");
const reservationRoutes = require("../../routes/reservation");

const routeSignatures = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) => {
      const methods = Object.keys(layer.route.methods).map((m) =>
        m.toUpperCase(),
      );
      return methods.map((method) => `${method} ${layer.route.path}`);
    });

describe("route definitions", () => {
  test("auth routes are mounted", () => {
    const signatures = routeSignatures(authRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining(["POST /register", "POST /login", "GET /me"]),
    );
  });

  test("restaurant routes are mounted", () => {
    const signatures = routeSignatures(restaurantRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "GET /",
        "GET /my",
        "GET /:id",
        "POST /",
        "PUT /:id",
        "DELETE /:id",
      ]),
    );
  });

  test("menu routes are mounted", () => {
    const signatures = routeSignatures(menuRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "GET /:restaurantId",
        "POST /",
        "PUT /:id",
        "DELETE /:id",
      ]),
    );
  });

  test("order routes are mounted", () => {
    const signatures = routeSignatures(orderRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "POST /",
        "GET /my",
        "GET /restaurant/:restaurantId",
        "PATCH /:id/status",
      ]),
    );
  });

  test("reservation routes are mounted", () => {
    const signatures = routeSignatures(reservationRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "POST /",
        "GET /my",
        "GET /restaurant/:restaurantId",
        "PATCH /:id/status",
      ]),
    );
  });
});
```

#### server/**tests**/utils/securityLogger.test.js

```javascript
const { createMockReq } = require("../helpers/httpMocks");
const { logSecurityEvent } = require("../../utils/securityLogger");

describe("securityLogger", () => {
  test("logs a security event with expected fields", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = createMockReq({ user: { id: "u1" } });

    logSecurityEvent("test_event", req, { extra: 123 });

    expect(spy).toHaveBeenCalledWith(
      "[SECURITY_EVENT]",
      expect.stringContaining('"event":"test_event"'),
    );
    spy.mockRestore();
  });

  test("handles missing user gracefully", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = createMockReq({ user: null });

    logSecurityEvent("no_user", req);

    const payload = JSON.parse(spy.mock.calls[0][1]);
    expect(payload.userId).toBeNull();
    spy.mockRestore();
  });
});
```

---

### Documentation

The following documentation files were created during this session:

- **OWASP top 10.md** — Full OWASP Top 10:2025 coverage documentation (see root directory)
- **server/SWAGGER_GUIDE.md** — Step-by-step Swagger usage guide with workflows and endpoint reference tables

---

## 6. Test Results

```
Test Suites: 13 passed, 13 total
Tests:       39 passed, 39 total
Snapshots:   0 total
```

All tests pass after all 5 phases of development.

---

## 7. How to Run

### Start the Server

```bash
cd server
npm install
npm run dev        # development with nodemon
# or
npm start          # production
```

### Run Tests

```bash
cd server
npm test                  # run all tests
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

### Access Swagger UI

```
http://localhost:5000/api-docs
```

### View Raw OpenAPI Spec

```
http://localhost:5000/api-docs.json
```

### Health Check

```
http://localhost:5000/api/health
```

### Security Audit

```bash
cd server
npm run security:audit
```

### Logger Configuration

Edit `server/config/loggerConfig.js` to enable/disable log levels:

```javascript
module.exports = {
  info: true, // Set to false to suppress info logs
  error: true, // Set to false to suppress error logs
  exception: true, // Set to false to suppress exception logs
};
```

Log output is written to:

- **Console** (stdout/stderr)
- **File** at `server/logs/app.log` (JSON format, one entry per line)

---

_End of chat export._
