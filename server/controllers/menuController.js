const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const logger = require("../utils/logger");

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
    logger.info("GET /api/menu/:restaurantId called", { params: req.params });

    if (!isValidObjectId(req.params.restaurantId)) {
      logger.error("getMenuByRestaurant — invalid restaurant ID", {
        restaurantId: req.params.restaurantId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    });

    logger.info("getMenuByRestaurant returned results", {
      restaurantId: req.params.restaurantId,
      count: items.length,
    });
    res.json({ success: true, data: items });
  } catch (error) {
    logger.exception("getMenuByRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    logger.info("POST /api/menu called", {
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.body.restaurant)) {
      logger.error("createMenuItem — invalid restaurant ID", {
        restaurant: req.body.restaurant,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      logger.error("createMenuItem — restaurant not found", {
        restaurant: req.body.restaurant,
      });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("createMenuItem — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
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

    logger.info("Menu item created", {
      menuItemId: item._id,
      name: item.name,
      restaurant: item.restaurant,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    logger.exception("createMenuItem threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    logger.info("PUT /api/menu/:id called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateMenuItem — invalid menu item ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id).populate("restaurant");
    if (!item) {
      logger.error("updateMenuItem — item not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    if (item.restaurant.owner.toString() !== req.user.id) {
      logger.error("updateMenuItem — not authorized", {
        ownerId: item.restaurant.owner,
        userId: req.user.id,
      });
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

    logger.info("Menu item updated", { menuItemId: updated._id });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.exception("updateMenuItem threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    logger.info("DELETE /api/menu/:id called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("deleteMenuItem — invalid menu item ID", {
        id: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid menu item id" });
    }

    const item = await MenuItem.findById(req.params.id).populate("restaurant");
    if (!item) {
      logger.error("deleteMenuItem — item not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    if (item.restaurant.owner.toString() !== req.user.id) {
      logger.error("deleteMenuItem — not authorized", {
        ownerId: item.restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await item.deleteOne();

    logger.info("Menu item deleted", { menuItemId: req.params.id });
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    logger.exception("deleteMenuItem threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
