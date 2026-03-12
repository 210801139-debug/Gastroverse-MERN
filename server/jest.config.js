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
