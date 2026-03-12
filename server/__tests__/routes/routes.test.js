const authRoutes = require("../../routes/auth");
const restaurantRoutes = require("../../routes/restaurant");
const menuRoutes = require("../../routes/menu");
const orderRoutes = require("../../routes/order");
const reservationRoutes = require("../../routes/reservation");

const routeSignatures = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) => {
      const methods = Object.keys(layer.route.methods).map((m) =>
        m.toUpperCase(),
      );
      return methods.map((method) => `${method} ${layer.route.path}`);
    });

describe("route definitions", () => {
  test("auth routes are mounted", () => {
    const signatures = routeSignatures(authRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining(["POST /register", "POST /login", "GET /me"]),
    );
  });

  test("restaurant routes are mounted", () => {
    const signatures = routeSignatures(restaurantRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "GET /",
        "GET /my",
        "GET /:id",
        "POST /",
        "PUT /:id",
        "DELETE /:id",
      ]),
    );
  });

  test("menu routes are mounted", () => {
    const signatures = routeSignatures(menuRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "GET /:restaurantId",
        "POST /",
        "PUT /:id",
        "DELETE /:id",
      ]),
    );
  });

  test("order routes are mounted", () => {
    const signatures = routeSignatures(orderRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "POST /",
        "GET /my",
        "GET /restaurant/:restaurantId",
        "PATCH /:id/status",
      ]),
    );
  });

  test("reservation routes are mounted", () => {
    const signatures = routeSignatures(reservationRoutes);
    expect(signatures).toEqual(
      expect.arrayContaining([
        "POST /",
        "GET /my",
        "GET /restaurant/:restaurantId",
        "PATCH /:id/status",
      ]),
    );
  });
});
