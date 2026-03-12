const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const pick = (source, allowed) =>
  allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

exports.getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isOpen: true }).populate(
      "owner",
      "name email",
    );
    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "cuisine",
      "address",
      "phone",
      "image",
      "isOpen",
    ];
    const payload = pick(req.body, allowedFields);
    payload.owner = req.user.id;

    const restaurant = await Restaurant.create(payload);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
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

    const allowedFields = [
      "name",
      "description",
      "cuisine",
      "address",
      "phone",
      "image",
      "isOpen",
    ];
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      pick(req.body, allowedFields),
      {
        new: true,
        runValidators: true,
      },
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
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

    await restaurant.deleteOne();
    res.json({ success: true, message: "Restaurant deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getMyRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user.id });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};
