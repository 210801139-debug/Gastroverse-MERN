const router = require("express").Router();
const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

router.post("/", protect, authorize("customer"), createOrder);
router.get("/my", protect, authorize("customer"), getMyOrders);
router.get("/restaurant/:restaurantId", protect, authorize("owner"), getRestaurantOrders);
router.patch("/:id/status", protect, authorize("owner"), updateOrderStatus);

module.exports = router;
