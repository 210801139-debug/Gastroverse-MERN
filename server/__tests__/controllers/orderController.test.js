const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/Order", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../models/Restaurant", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/MenuItem", () => ({
  find: jest.fn(),
}));

const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Restaurant = require("../../models/Restaurant");
const MenuItem = require("../../models/MenuItem");
const controller = require("../../controllers/orderController");

describe("orderController", () => {
  test("createOrder returns 400 for invalid restaurant id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ body: { restaurant: "bad", items: [] } });
    const res = createMockRes();

    await controller.createOrder(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOrder computes totalAmount from DB prices", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ isOpen: true });
    MenuItem.find.mockResolvedValue([
      { _id: "i1", price: 100 },
      { _id: "i2", price: 50 },
    ]);
    Order.create.mockResolvedValue({ _id: "ord1" });

    const req = createMockReq({
      user: { id: "c1" },
      body: {
        restaurant: "507f191e810c19729de860ea",
        items: [
          { menuItem: "i1", quantity: 2 },
          { menuItem: "i2", quantity: 3 },
        ],
      },
    });
    const res = createMockRes();

    await controller.createOrder(req, res, jest.fn());

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 350, customer: "c1" }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("updateOrderStatus blocks invalid transition", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        status: "pending",
        restaurant: { owner: { toString: () => "o1" } },
        save: jest.fn(),
      }),
    });

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      user: { id: "o1" },
      body: { status: "delivered" },
    });
    const res = createMockRes();

    await controller.updateOrderStatus(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
