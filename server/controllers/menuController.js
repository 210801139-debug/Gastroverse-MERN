const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const pick = (source, allowed) =>
  allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

exports.getMenuByRestaurant = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.body.restaurant)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.body.restaurant);
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
      "price",
      "category",
      "image",
      "restaurant",
      "isAvailable",
    ];
    const item = await MenuItem.create(pick(req.body, allowedFields));
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id).populate("restaurant");
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    if (item.restaurant.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "isAvailable",
    ];
    const updated = await MenuItem.findByIdAndUpdate(
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

exports.deleteMenuItem = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id).populate("restaurant");
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    if (item.restaurant.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    next(error);
  }
};
