const router = require("express").Router();
const {
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

router.get("/:restaurantId", getMenuByRestaurant);
router.post("/", protect, authorize("owner"), createMenuItem);
router.put("/:id", protect, authorize("owner"), updateMenuItem);
router.delete("/:id", protect, authorize("owner"), deleteMenuItem);

module.exports = router;
