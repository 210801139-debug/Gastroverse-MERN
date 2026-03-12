const router = require("express").Router();
const {
  getMenuByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

/**
 * @swagger
 * /menu/{restaurantId}:
 *   get:
 *     summary: Get all available menu items for a restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of available menu items
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
 *                     $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid restaurant ID
 */
router.get("/:restaurantId", getMenuByRestaurant);

/**
 * @swagger
 * /menu:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category, restaurant]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Margherita Pizza
 *               description:
 *                 type: string
 *                 example: Classic pizza with tomato and mozzarella
 *               price:
 *                 type: number
 *                 example: 12.99
 *               category:
 *                 type: string
 *                 enum: [appetizer, main, dessert, beverage, side]
 *                 example: main
 *               image:
 *                 type: string
 *                 example: https://example.com/pizza.jpg
 *               restaurant:
 *                 type: string
 *                 example: 665a1b2c3d4e5f6a7b8c9d0e
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Menu item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (owner role required)
 *       404:
 *         description: Restaurant not found
 */
router.post("/", protect, authorize("owner"), createMenuItem);

/**
 * @swagger
 * /menu/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
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
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [appetizer, main, dessert, beverage, side]
 *               image:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid menu item ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Menu item not found
 */
router.put("/:id", protect, authorize("owner"), updateMenuItem);

/**
 * @swagger
 * /menu/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item deleted
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
 *                   example: Menu item deleted
 *       400:
 *         description: Invalid menu item ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Menu item not found
 */
router.delete("/:id", protect, authorize("owner"), deleteMenuItem);

module.exports = router;
