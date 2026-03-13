import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Orders from "../pages/Orders";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from "../services/api";

describe("Orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    render(<Orders />);
    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  it("shows no orders message when empty", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    render(<Orders />);
    await waitFor(() => {
      expect(screen.getByText("No orders yet.")).toBeInTheDocument();
    });
  });

  it("renders orders list", async () => {
    const orders = [
      {
        _id: "o1",
        restaurant: { name: "Pizza Place" },
        status: "confirmed",
        items: [
          { menuItem: { name: "Margherita" }, quantity: 2, price: 15.0 },
        ],
        totalAmount: 30.0,
        createdAt: "2026-03-13T12:00:00Z",
      },
      {
        _id: "o2",
        restaurant: { name: "Burger Joint" },
        status: "delivered",
        items: [
          { menuItem: { name: "Cheeseburger" }, quantity: 1, price: 12.5 },
        ],
        totalAmount: 12.5,
        createdAt: "2026-03-12T18:00:00Z",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: orders } });
    render(<Orders />);
    await waitFor(() => {
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });
    expect(screen.getByText("Burger Joint")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("renders order heading", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    render(<Orders />);
    await waitFor(() => {
      expect(screen.getByText("My Orders")).toBeInTheDocument();
    });
  });

  it("displays order items with quantities", async () => {
    const orders = [
      {
        _id: "o1",
        restaurant: { name: "Pizza Place" },
        status: "confirmed",
        items: [
          { menuItem: { name: "Margherita" }, quantity: 2, price: 15.0 },
          { menuItem: { name: "Garlic Bread" }, quantity: 1, price: 5.0 },
        ],
        totalAmount: 35.0,
        createdAt: "2026-03-13T12:00:00Z",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: orders } });
    render(<Orders />);
    await waitFor(() => {
      expect(screen.getByText(/Margherita x2/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Garlic Bread x1/)).toBeInTheDocument();
  });

  it("calls the correct API endpoint", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    render(<Orders />);
    expect(api.get).toHaveBeenCalledWith("/orders/my");
  });
});
