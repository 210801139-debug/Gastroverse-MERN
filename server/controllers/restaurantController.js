const Restaurant = require("../models/Restaurant");

exports.getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isOpen: true }).populate("owner", "name email");
    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate("owner", "name email");
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
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
