const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Reservation date is required"],
    },
    time: {
      type: String,
      required: [true, "Reservation time is required"],
    },
    partySize: {
      type: Number,
      required: [true, "Party size is required"],
      min: 1,
      max: 20,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
