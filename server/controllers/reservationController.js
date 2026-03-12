const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");

exports.createReservation = async (req, res, next) => {
  try {
    req.body.customer = req.user.id;
    const reservation = await Reservation.create(req.body);
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
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const reservations = await Reservation.find({ restaurant: req.params.restaurantId })
      .populate("customer", "name email phone")
      .sort("-date");
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("restaurant");
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }
    if (reservation.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    reservation.status = req.body.status;
    await reservation.save();
    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};
