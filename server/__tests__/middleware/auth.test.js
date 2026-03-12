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
