const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");
const logger = require("../utils/logger");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const allowedReservationStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

exports.createReservation = async (req, res, next) => {
  try {
    logger.info("POST /api/reservations called", {
      body: req.body,
      userId: req.user?.id,
    });

    const { restaurant, date, time, partySize, notes } = req.body;

    if (!isValidObjectId(restaurant)) {
      logger.error("createReservation — invalid restaurant ID", { restaurant });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      logger.error("createReservation — restaurant not found", { restaurant });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    if (!restaurantDoc.isOpen) {
      logger.error("createReservation — restaurant is closed", { restaurant });
      return res.status(400).json({
        success: false,
        message: "Cannot reserve: restaurant is currently closed",
      });
    }

    const reservationDate = new Date(date);
    if (
      Number.isNaN(reservationDate.getTime()) ||
      reservationDate <= new Date()
    ) {
      logger.error("createReservation — invalid or past date", { date });
      return res.status(400).json({
        success: false,
        message: "Reservation date must be a valid future date",
      });
    }

    const parsedPartySize = Number(partySize);
    if (
      !Number.isInteger(parsedPartySize) ||
      parsedPartySize < 1 ||
      parsedPartySize > 20
    ) {
      logger.error("createReservation — invalid party size", { partySize });
      return res.status(400).json({
        success: false,
        message: "Party size must be an integer between 1 and 20",
      });
    }

    const reservation = await Reservation.create({
      customer: req.user.id,
      restaurant,
      date: reservationDate,
      time: String(time || "").trim(),
      partySize: parsedPartySize,
      status: "pending",
      notes: notes ? String(notes).trim().slice(0, 500) : undefined,
    });

    logger.info("Reservation created", {
      reservationId: reservation._id,
      restaurant,
      date: reservationDate,
      partySize: parsedPartySize,
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    logger.exception("createReservation threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    logger.info("GET /api/reservations/my called", { userId: req.user.id });

    const reservations = await Reservation.find({ customer: req.user.id })
      .populate("restaurant", "name address")
      .sort("-date");

    logger.info("getMyReservations returned results", {
      count: reservations.length,
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    logger.exception("getMyReservations threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getRestaurantReservations = async (req, res, next) => {
  try {
    logger.info("GET /api/reservations/restaurant/:restaurantId called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.restaurantId)) {
      logger.error("getRestaurantReservations — invalid restaurant ID", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      logger.error("getRestaurantReservations — restaurant not found", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("getRestaurantReservations — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const reservations = await Reservation.find({
      restaurant: req.params.restaurantId,
    })
      .populate("customer", "name email phone")
      .sort("-date");

    logger.info("getRestaurantReservations returned results", {
      restaurantId: req.params.restaurantId,
      count: reservations.length,
    });
    res.json({ success: true, data: reservations });
  } catch (error) {
    logger.exception("getRestaurantReservations threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    logger.info("PATCH /api/reservations/:id/status called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateReservationStatus — invalid reservation ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation id" });
    }

    const status = String(req.body.status || "").trim();
    if (!allowedReservationStatuses.includes(status)) {
      logger.error("updateReservationStatus — invalid status value", {
        status,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const reservation = await Reservation.findById(req.params.id).populate(
      "restaurant",
    );
    if (!reservation) {
      logger.error("updateReservationStatus — reservation not found", {
        id: req.params.id,
      });
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    if (reservation.restaurant.owner.toString() !== req.user.id) {
      logger.error("updateReservationStatus — not authorized", {
        ownerId: reservation.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const previousStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    logger.info("Reservation status updated", {
      reservationId: reservation._id,
      from: previousStatus,
      to: status,
    });
    res.json({ success: true, data: reservation });
  } catch (error) {
    logger.exception("updateReservationStatus threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
