const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");

exports.createOrder = async (req, res, next) => {
  try {
    req.body.customer = req.user.id;
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("restaurant", "name")
      .populate("items.menuItem", "name price")
      .sort("-createdAt");
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantOrders = async (req, res, next) => {
  try {
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

    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate("customer", "name email phone")
      .populate("items.menuItem", "name price")
      .sort("-createdAt");
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("restaurant");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.restaurant.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    order.status = req.body.status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
