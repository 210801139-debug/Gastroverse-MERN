const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    category: {
      type: String,
      enum: ["appetizer", "main", "dessert", "beverage", "side"],
      required: true,
    },
    image: String,
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
