const router = require("express").Router();
const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurant, items]
 *             properties:
 *               restaurant:
 *                 type: string
 *                 description: Restaurant ID
 *                 example: 665a1b2c3d4e5f6a7b8c9d0e
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [menuItem, quantity]
 *                   properties:
 *                     menuItem:
 *                       type: string
 *                       description: Menu item ID
 *                       example: 665a1b2c3d4e5f6a7b8c9d0e
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 20
 *                       example: 2
 *               notes:
 *                 type: string
 *                 example: No onions please
 *     responses:
 *       201:
 *         description: Order created (totalAmount computed server-side)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error (invalid ID, empty items, restaurant closed, etc.)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (customer role required)
 *       404:
 *         description: Restaurant not found
 */
router.post("/", protect, authorize("customer"), createOrder);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get orders for the current customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer's orders
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
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (customer role required)
 */
router.get("/my", protect, authorize("customer"), getMyOrders);

/**
 * @swagger
 * /orders/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all orders for a restaurant (owner only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of restaurant orders
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
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid restaurant ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (owner role required)
 *       404:
 *         description: Restaurant not found
 */
router.get(
  "/restaurant/:restaurantId",
  protect,
  authorize("owner"),
  getRestaurantOrders,
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (owner only)
 *     description: |
 *       Valid status transitions:
 *       - pending → confirmed, cancelled
 *       - confirmed → preparing, cancelled
 *       - preparing → ready
 *       - ready → delivered
 *       - delivered → (none)
 *       - cancelled → (none)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, preparing, ready, delivered, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid ID or invalid status transition
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status", protect, authorize("owner"), updateOrderStatus);

module.exports = router;
