const router = require("express").Router();
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
} = require("../controllers/restaurantController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

router.get("/", getRestaurants);
router.get("/my", protect, authorize("owner"), getMyRestaurants);
router.get("/:id", getRestaurant);
router.post("/", protect, authorize("owner"), createRestaurant);
router.put("/:id", protect, authorize("owner"), updateRestaurant);
router.delete("/:id", protect, authorize("owner"), deleteRestaurant);

module.exports = router;
