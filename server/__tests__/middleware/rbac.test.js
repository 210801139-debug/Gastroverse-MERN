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
