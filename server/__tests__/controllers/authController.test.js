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
