const mongoose = require("mongoose");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validStatusTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["delivered"],
  delivered: [],
  cancelled: [],
};

exports.createOrder = async (req, res, next) => {
  try {
    const { restaurant, items, notes } = req.body;

    if (!isValidObjectId(restaurant)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Order must include at least one item",
        });
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
        message: "Cannot place order: restaurant is currently closed",
      });
    }

    const menuItemIds = items.map((item) => item.menuItem);
    if (!menuItemIds.every((id) => isValidObjectId(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id in order" });
    }

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurant,
      isAvailable: true,
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more items are invalid or unavailable",
      });
    }

    const menuById = new Map(menuItems.map((item) => [String(item._id), item]));
    const normalizedItems = items.map((item) => {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        throw new Error(
          "Each item quantity must be an integer between 1 and 20",
        );
      }

      const menuItem = menuById.get(String(item.menuItem));
      return {
        menuItem: menuItem._id,
        quantity: qty,
        price: menuItem.price,
      };
    });

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      customer: req.user.id,
      restaurant,
      items: normalizedItems,
      totalAmount,
      status: "pending",
      notes: notes ? String(notes).trim().slice(0, 500) : undefined,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (error.message.includes("quantity")) {
      return res.status(400).json({ success: false, message: error.message });
    }
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
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    const nextStatus = String(req.body.status || "").trim();
    if (!nextStatus) {
      return res
        .status(400)
        .json({ success: false, message: "status is required" });
    }

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

    const allowedTransitions = validStatusTransitions[order.status] || [];
    if (!allowedTransitions.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${nextStatus}`,
      });
    }

    order.status = nextStatus;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
