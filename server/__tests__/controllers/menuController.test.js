const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/MenuItem", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../models/Restaurant", () => ({
  findById: jest.fn(),
}));

const mongoose = require("mongoose");
const MenuItem = require("../../models/MenuItem");
const Restaurant = require("../../models/Restaurant");
const controller = require("../../controllers/menuController");

describe("menuController", () => {
  test("getMenuByRestaurant returns 400 for invalid id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ params: { restaurantId: "bad" } });
    const res = createMockRes();

    await controller.getMenuByRestaurant(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createMenuItem returns 403 for non-owner", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ owner: { toString: () => "o2" } });

    const req = createMockReq({
      user: { id: "o1" },
      body: { restaurant: "507f191e810c19729de860ea" },
    });
    const res = createMockRes();

    await controller.createMenuItem(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("updateMenuItem filters payload fields", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    MenuItem.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        restaurant: { owner: { toString: () => "o1" } },
      }),
    });
    MenuItem.findByIdAndUpdate.mockResolvedValue({ _id: "m1" });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "o1" },
      body: { name: "Soup", random: "ignored" },
    });
    const res = createMockRes();

    await controller.updateMenuItem(req, res, jest.fn());

    expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      expect.objectContaining({ name: "Soup" }),
      expect.any(Object),
    );
    expect(MenuItem.findByIdAndUpdate.mock.calls[0][1].random).toBeUndefined();
  });
});
