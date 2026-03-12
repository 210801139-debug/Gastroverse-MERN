const router = require("express").Router();
const {
  createReservation,
  getMyReservations,
  getRestaurantReservations,
  updateReservationStatus,
} = require("../controllers/reservationController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/rbac");

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurant, date, time, partySize]
 *             properties:
 *               restaurant:
 *                 type: string
 *                 description: Restaurant ID
 *                 example: 665a1b2c3d4e5f6a7b8c9d0e
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Reservation date (must be in the future)
 *                 example: "2026-04-15"
 *               time:
 *                 type: string
 *                 description: Reservation time
 *                 example: "19:00"
 *               partySize:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 example: 4
 *               notes:
 *                 type: string
 *                 example: Window seat preferred
 *     responses:
 *       201:
 *         description: Reservation created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Validation error (invalid ID, past date, invalid party size, restaurant closed)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (customer role required)
 *       404:
 *         description: Restaurant not found
 */
router.post("/", protect, authorize("customer"), createReservation);

/**
 * @swagger
 * /reservations/my:
 *   get:
 *     summary: Get reservations for the current customer
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer's reservations
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
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (customer role required)
 */
router.get("/my", protect, authorize("customer"), getMyReservations);

/**
 * @swagger
 * /reservations/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all reservations for a restaurant (owner only)
 *     tags: [Reservations]
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
 *         description: List of restaurant reservations
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
 *                     $ref: '#/components/schemas/Reservation'
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
  getRestaurantReservations,
);

/**
 * @swagger
 * /reservations/{id}/status:
 *   patch:
 *     summary: Update reservation status (owner only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
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
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Reservation status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid ID or invalid status value
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Reservation not found
 */
router.patch(
  "/:id/status",
  protect,
  authorize("owner"),
  updateReservationStatus,
);

module.exports = router;
