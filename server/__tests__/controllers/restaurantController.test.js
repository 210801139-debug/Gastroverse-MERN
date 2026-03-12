const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/Restaurant", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const mongoose = require("mongoose");
const Restaurant = require("../../models/Restaurant");
const controller = require("../../controllers/restaurantController");

describe("restaurantController", () => {
  test("getRestaurant returns 400 for invalid id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ params: { id: "bad" } });
    const res = createMockRes();

    await controller.getRestaurant(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createRestaurant assigns owner and filters fields", async () => {
    Restaurant.create.mockResolvedValue({ _id: "r1" });
    const req = createMockReq({
      user: { id: "owner-1" },
      body: { name: "R", owner: "bad", random: "ignore" },
    });
    const res = createMockRes();

    await controller.createRestaurant(req, res, jest.fn());

    expect(Restaurant.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "R", owner: "owner-1" }),
    );
    expect(Restaurant.create.mock.calls[0][0].random).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("updateRestaurant returns 403 for non-owner", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ owner: { toString: () => "x" } });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "owner-1" },
      body: { name: "New" },
    });
    const res = createMockRes();

    await controller.updateRestaurant(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("deleteRestaurant calls deleteOne for owner", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const deleteOne = jest.fn().mockResolvedValue(undefined);
    Restaurant.findById.mockResolvedValue({
      owner: { toString: () => "owner-1" },
      deleteOne,
    });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "owner-1" },
    });
    const res = createMockRes();

    await controller.deleteRestaurant(req, res, jest.fn());

    expect(deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
