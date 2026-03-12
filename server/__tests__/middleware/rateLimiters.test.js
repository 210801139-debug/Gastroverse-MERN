const { apiLimiter, authLimiter } = require("../../middleware/rateLimiters");

describe("rateLimiters", () => {
  test("exports apiLimiter and authLimiter", () => {
    expect(typeof apiLimiter).toBe("function");
    expect(typeof authLimiter).toBe("function");
  });
});
