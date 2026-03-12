jest.mock("mongoose", () => ({
  connect: jest.fn(),
  set: jest.fn(),
}));

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

const mongoose = require("mongoose");
const connectDB = require("../../config/db");

describe("connectDB", () => {
  let exitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  test("connects using MONGO_URI", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/testdb";
    mongoose.connect.mockResolvedValue({ connection: { host: "localhost" } });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
  });

  test("falls back from mongo host to localhost when ENOTFOUND", async () => {
    process.env.MONGO_URI = "mongodb://mongo:27017/testdb";
    mongoose.connect
      .mockRejectedValueOnce({ code: "ENOTFOUND", message: "not found" })
      .mockResolvedValueOnce({ connection: { host: "localhost" } });

    await connectDB();

    expect(mongoose.connect).toHaveBeenNthCalledWith(
      2,
      "mongodb://localhost:27017/testdb",
      { serverSelectionTimeoutMS: 8000 },
    );
  });
});
