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
