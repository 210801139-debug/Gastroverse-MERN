const mongoose = require("mongoose");
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

exports.getRestaurants = async (req, res, next) => {
  try {
    logger.info("GET /api/restaurants called");

    const restaurants = await Restaurant.find({ isOpen: true }).populate(
      "owner",
      "name email",
    );

    logger.info("getRestaurants returned results", {
      count: restaurants.length,
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    logger.exception("getRestaurants threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    logger.info("GET /api/restaurants/:id called", { params: req.params });

    if (!isValidObjectId(req.params.id)) {
      logger.error("getRestaurant — invalid ID", { id: req.params.id });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!restaurant) {
      logger.error("getRestaurant — not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    logger.info("getRestaurant returned result", {
      restaurantId: restaurant._id,
    });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    logger.exception("getRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    logger.info("POST /api/restaurants called", {
      body: req.body,
      userId: req.user.id,
    });

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

    logger.info("Restaurant created", {
      restaurantId: restaurant._id,
      name: restaurant.name,
    });
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    logger.exception("createRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    logger.info("PUT /api/restaurants/:id called", {
      params: req.params,
      body: req.body,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("updateRestaurant — invalid ID", { id: req.params.id });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      logger.error("updateRestaurant — not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("updateRestaurant — not authorized", {
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

    logger.info("Restaurant updated", { restaurantId: updated._id });
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.exception("updateRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    logger.info("DELETE /api/restaurants/:id called", {
      params: req.params,
      userId: req.user.id,
    });

    if (!isValidObjectId(req.params.id)) {
      logger.error("deleteRestaurant — invalid ID", { id: req.params.id });
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      logger.error("deleteRestaurant — not found", { id: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      logger.error("deleteRestaurant — not authorized", {
        ownerId: restaurant.owner,
        userId: req.user.id,
      });
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await restaurant.deleteOne();

    logger.info("Restaurant deleted", { restaurantId: req.params.id });
    res.json({ success: true, message: "Restaurant deleted" });
  } catch (error) {
    logger.exception("deleteRestaurant threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

exports.getMyRestaurants = async (req, res, next) => {
  try {
    logger.info("GET /api/restaurants/my called", { userId: req.user.id });

    const restaurants = await Restaurant.find({ owner: req.user.id });

    logger.info("getMyRestaurants returned results", {
      count: restaurants.length,
    });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    logger.exception("getMyRestaurants threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
