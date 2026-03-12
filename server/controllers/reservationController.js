const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const allowedReservationStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

exports.createReservation = async (req, res, next) => {
  try {
    const { restaurant, date, time, partySize, notes } = req.body;

    if (!isValidObjectId(restaurant)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    if (!restaurantDoc.isOpen) {
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

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.id })
      .populate("restaurant", "name address")
      .sort("-date");
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantReservations = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const reservations = await Reservation.find({
      restaurant: req.params.restaurantId,
    })
      .populate("customer", "name email phone")
      .sort("-date");
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation id" });
    }

    const status = String(req.body.status || "").trim();
    if (!allowedReservationStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const reservation = await Reservation.findById(req.params.id).populate(
      "restaurant",
    );
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    if (reservation.restaurant.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    reservation.status = status;
    await reservation.save();
    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};
