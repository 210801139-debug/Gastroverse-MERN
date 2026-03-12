const { createMockReq } = require("../helpers/httpMocks");
const { logSecurityEvent } = require("../../utils/securityLogger");

describe("securityLogger", () => {
  test("writes structured security log", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const req = createMockReq({
      method: "POST",
      originalUrl: "/api/auth/login",
    });

    logSecurityEvent("failed_login_attempt", req, { email: "a@b.com" });

    expect(warnSpy).toHaveBeenCalledWith(
      "[SECURITY_EVENT]",
      expect.stringContaining("failed_login_attempt"),
    );

    warnSpy.mockRestore();
  });
});
