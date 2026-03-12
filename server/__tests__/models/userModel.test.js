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
