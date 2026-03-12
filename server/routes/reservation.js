const router = require("express").Router();
const {
  createReservation,
  getMyReservations,
  getRestaurantReservations,
  updateReservationStatus,
} = require("../controllers/reservationController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

router.post("/", protect, authorize("customer"), createReservation);
router.get("/my", protect, authorize("customer"), getMyReservations);
router.get(
  "/restaurant/:restaurantId",
  protect,
  authorize("owner"),
  getRestaurantReservations,
);
router.patch(
  "/:id/status",
  protect,
  authorize("owner"),
  updateReservationStatus,
);

module.exports = router;
