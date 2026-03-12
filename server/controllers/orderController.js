const mongoose = require("mongoose");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const logger = require("../utils/logger");

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
    logger.info("POST /api/orders called", {
      body: req.body,
      userId: req.user?.id,
    });

    const { restaurant, items, notes } = req.body;

    if (!isValidObjectId(restaurant)) {
      logger.error("createOrder — invalid restaurant ID", { restaurant });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      logger.error("createOrder — empty or missing items");
      return res.status(400).json({
        success: false,
        message: "Order must include at least one item",
      });
    }

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      logger.error("createOrder — restaurant not found", { restaurant });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    if (!restaurantDoc.isOpen) {
      logger.error("createOrder — restaurant is closed", { restaurant });
      return res.status(400).json({
        success: false,
        message: "Cannot place order: restaurant is currently closed",
      });
    }

    const menuItemIds = items.map((item) => item.menuItem);
    if (!menuItemIds.every((id) => isValidObjectId(id))) {
      logger.error("createOrder — invalid menu item ID in order", {
        menuItemIds,
      });
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
      logger.error("createOrder — some items invalid or unavailable", {
        expected: menuItemIds.length,
        found: menuItems.length,
      });
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

    logger.info("Order created", {
      orderId: order._id,
      restaurant,
      totalAmount,
      itemCount: normalizedItems.length,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    if (error.message.includes("quantity")) {
      logger.error("createOrder — quantity validation error", {
        error: error.message,
      });
      return res.status(400).json({ success: false, message: error.message });
    }
    logger.exception("createOrder threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    logger.info("GET /api/orders/my called", { userId: req.user.id });

    const orders = await Order.find({ customer: req.user.id })
      .populate("restaurant", "name")
      .populate("items.menuItem", "name price")
      .sort("-createdAt");

    logger.info("getMyOrders returned results", { count: orders.length });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.exception("getMyOrders threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getRestaurantOrders = async (req, res, next) => {
  try {
    logger.info("GET /api/orders/restaurant/:restaurantId called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.restaurantId)) {
      logger.error("getRestaurantOrders — invalid restaurant ID", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      logger.error("getRestaurantOrders — restaurant not found", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("getRestaurantOrders — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate("customer", "name email phone")
      .populate("items.menuItem", "name price")
      .sort("-createdAt");

    logger.info("getRestaurantOrders returned results", {
      restaurantId: req.params.restaurantId,
      count: orders.length,
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.exception("getRestaurantOrders threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    logger.info("PATCH /api/orders/:id/status called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateOrderStatus — invalid order ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    const nextStatus = String(req.body.status || "").trim();
    if (!nextStatus) {
      logger.error("updateOrderStatus — missing status field");
      return res
        .status(400)
        .json({ success: false, message: "status is required" });
    }

    const order = await Order.findById(req.params.id).populate("restaurant");
    if (!order) {
      logger.error("updateOrderStatus — order not found", {
        id: req.params.id,
      });
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.restaurant.owner.toString() !== req.user.id) {
      logger.error("updateOrderStatus — not authorized", {
        ownerId: order.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const allowedTransitions = validStatusTransitions[order.status] || [];
    if (!allowedTransitions.includes(nextStatus)) {
      logger.error("updateOrderStatus — invalid transition", {
        from: order.status,
        to: nextStatus,
      });
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${nextStatus}`,
      });
    }

    order.status = nextStatus;
    await order.save();

    logger.info("Order status updated", {
      orderId: order._id,
      from: order.status,
      to: nextStatus,
    });
    res.json({ success: true, data: order });
  } catch (error) {
    logger.exception("updateOrderStatus threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
