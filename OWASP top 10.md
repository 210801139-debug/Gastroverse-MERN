# OWASP Top 10 (2025) Coverage - Gastroverse

This document explains how the project mitigates each OWASP Top 10:2025 category within the current architecture and scope.

## Scope

- Stack: Node.js, Express, MongoDB (Mongoose), JWT auth.
- Focus: API layer, auth/authorization, request handling, error handling, logging.
- Out of scope: full SOC monitoring pipeline, WAF, enterprise IAM, SAST/DAST CI orchestration, and cloud-specific hardening.

## A01:2025 - Broken Access Control

Implemented controls:

- Route protection with `protect` middleware and role checks via `authorize(...)`.
- Ownership checks on owner-only resources (restaurant, menu, order status, reservation status).
- ObjectId validation to prevent malformed ID bypass patterns.

Where:

- `server/middleware/auth.js`
- `server/middleware/rbac.js`
- `server/controllers/restaurantController.js`
- `server/controllers/menuController.js`
- `server/controllers/orderController.js`
- `server/controllers/reservationController.js`

## A02:2025 - Security Misconfiguration

Implemented controls:

- Startup validation for critical env vars (`MONGO_URI`, `JWT_SECRET`).
- Warning/guardrails for weak JWT secrets.
- `helmet` enabled, `x-powered-by` disabled.
- CORS allowlist controlled by `CORS_ORIGIN`.
- Request body size limit (`16mb`) and global API rate limit.

Where:

- `server/server.js`
- `.env`

## A03:2025 - Software Supply Chain Failures

Implemented controls:

- Dependency lockfile usage (`package-lock.json`) retained.
- Security audit script added for repeatable checks.

Where:

- `server/package.json` (`security:audit` script)

How to run:

```bash
cd server
npm run security:audit
```

## A04:2025 - Cryptographic Failures

Implemented controls:

- Password hashing with bcrypt (`bcryptjs`) in model pre-save hook.
- JWT signed and verified with explicit algorithm (`HS256`) and claims (`issuer`, `audience`).
- Strong-secret policy guidance in config validation.

Where:

- `server/models/User.js`
- `server/controllers/authController.js`
- `server/middleware/auth.js`
- `server/server.js`
- `.env`

## A05:2025 - Injection

Implemented controls:

- `express-mongo-sanitize` enabled globally.
- Strict ObjectId validation before DB queries in critical controllers.
- Field allowlisting (`pick`) to reduce mass assignment and unsafe input propagation.
- Mongoose strict query mode enabled.

Where:

- `server/server.js`
- `server/config/db.js`
- `server/controllers/restaurantController.js`
- `server/controllers/menuController.js`
- `server/controllers/orderController.js`
- `server/controllers/reservationController.js`

## A06:2025 - Insecure Design

Implemented controls:

- Business-rule enforcement in API logic (not trusting client data):
  - Order totals calculated server-side from actual menu prices.
  - Menu items must belong to requested restaurant and be available.
  - Reservation date must be in the future.
  - Party size bounds validation.

Where:

- `server/controllers/orderController.js`
- `server/controllers/reservationController.js`

## A07:2025 - Authentication Failures

Implemented controls:

- Auth endpoint rate limiting (`/register`, `/login`) to reduce brute force.
- Normalized credential handling.
- JWT verification with strict claim checks and safe unauthorized responses.

Where:

- `server/routes/auth.js`
- `server/middleware/rateLimiters.js`
- `server/controllers/authController.js`
- `server/middleware/auth.js`

## A08:2025 - Software or Data Integrity Failures

Implemented controls:

- Server-side trusted computation for order line prices and totals.
- Controlled status transitions for order lifecycle.
- Controlled reservation status input via allowlist.
- Owner/customer identity is server-assigned from authenticated session, not client payload.

Where:

- `server/controllers/orderController.js`
- `server/controllers/reservationController.js`

## A09:2025 - Security Logging and Alerting Failures

Implemented controls:

- Structured security event logging for failed auth, forbidden actions, and server errors.
- Security events include timestamp, IP, path, method, user agent, and user context when available.

Where:

- `server/utils/securityLogger.js`
- `server/middleware/auth.js`
- `server/middleware/rbac.js`
- `server/middleware/errorHandler.js`

Note:

- Current implementation logs to application stdout/stderr. Integrating centralized alerting (SIEM) is a recommended next step.

## A10:2025 - Mishandling of Exceptional Conditions

Implemented controls:

- Centralized `notFound` and `errorHandler` middleware.
- Error normalization for CastError, ValidationError, and JWT errors.
- Stack traces hidden in non-development environments.
- Process-level handlers for `unhandledRejection` and `uncaughtException`.

Where:

- `server/middleware/errorHandler.js`
- `server/server.js`

## Additional Operational Guidance

- Replace `JWT_SECRET` with a high-entropy secret (>= 32 characters) before production.
- Keep `CORS_ORIGIN` explicit (no wildcard) for deployed environments.
- Run dependency security checks regularly:

```bash
cd server
npm run security:audit
```

- Consider adding:
  - centralized logging + alert rules,
  - CI pipeline checks (audit, lint, tests),
  - secret scanning,
  - refresh token rotation and revocation strategy.
