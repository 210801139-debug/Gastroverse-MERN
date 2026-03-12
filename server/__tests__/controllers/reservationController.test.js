const { createMockReq, createMockRes } = require("../helpers/httpMocks");

jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../../models/Reservation", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../models/Restaurant", () => ({
  findById: jest.fn(),
}));

const mongoose = require("mongoose");
const Reservation = require("../../models/Reservation");
const Restaurant = require("../../models/Restaurant");
const controller = require("../../controllers/reservationController");

describe("reservationController", () => {
  test("createReservation returns 400 for invalid restaurant id", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const req = createMockReq({ body: { restaurant: "bad" } });
    const res = createMockRes();

    await controller.createReservation(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createReservation returns 400 for past date", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ isOpen: true });

    const req = createMockReq({
      body: {
        restaurant: "507f191e810c19729de860ea",
        date: "2000-01-01",
        time: "12:00",
        partySize: 2,
      },
      user: { id: "c1" },
    });
    const res = createMockRes();

    await controller.createReservation(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createReservation succeeds with valid payload", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Restaurant.findById.mockResolvedValue({ isOpen: true });
    Reservation.create.mockResolvedValue({ _id: "res1" });

    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const req = createMockReq({
      user: { id: "c1" },
      body: {
        restaurant: "507f191e810c19729de860ea",
        date: future,
        time: "13:00",
        partySize: 4,
      },
    });
    const res = createMockRes();

    await controller.createReservation(req, res, jest.fn());

    expect(Reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "c1", partySize: 4 }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("updateReservationStatus validates status", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);

    const req = createMockReq({
      params: { id: "507f191e810c19729de860ea" },
      body: { status: "unknown" },
      user: { id: "o1" },
    });
    const res = createMockRes();

    await controller.updateReservationStatus(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
