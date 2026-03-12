const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

exports.getMenuByRestaurant = async (req, res, next) => {
  try {
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

    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
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

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
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
