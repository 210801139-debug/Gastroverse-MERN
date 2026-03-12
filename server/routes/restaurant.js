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

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all open restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of open restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 */
router.get("/", getRestaurants);

/**
 * @swagger
 * /restaurants/my:
 *   get:
 *     summary: Get restaurants owned by the current user
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (owner role required)
 */
router.get("/my", protect, authorize("owner"), getMyRestaurants);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get a single restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid restaurant ID
 *       404:
 *         description: Restaurant not found
 */
router.get("/:id", getRestaurant);

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: The Great Kitchen
 *               description:
 *                 type: string
 *                 example: A fine-dining experience
 *               cuisine:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Italian", "French"]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 123 Main St
 *                   city:
 *                     type: string
 *                     example: New York
 *                   state:
 *                     type: string
 *                     example: NY
 *                   zipCode:
 *                     type: string
 *                     example: "10001"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               isOpen:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Restaurant created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (owner role required)
 */
router.post("/", protect, authorize("owner"), createRestaurant);

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisine:
 *                 type: array
 *                 items:
 *                   type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *               phone:
 *                 type: string
 *               image:
 *                 type: string
 *               isOpen:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Restaurant updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Restaurant not found
 */
router.put("/:id", protect, authorize("owner"), updateRestaurant);

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Restaurant deleted
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Restaurant not found
 */
router.delete("/:id", protect, authorize("owner"), deleteRestaurant);

module.exports = router;
