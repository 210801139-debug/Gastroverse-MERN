import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import api from "../services/api";

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("shows no restaurants message when owner has none", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    render(<Dashboard />);
    await waitFor(() => {
      expect(
        screen.getByText(/haven't created any restaurants yet/i)
      ).toBeInTheDocument();
    });
  });

  it("renders restaurant select and analytics when restaurants exist", async () => {
    const restaurants = [
      { _id: "r1", name: "Test Restaurant" },
      { _id: "r2", name: "Another Restaurant" },
    ];
    api.get
      .mockResolvedValueOnce({ data: { data: restaurants } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Owner Dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Select Restaurant")).toBeInTheDocument();
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
  });

  it("shows order and reservation counts", async () => {
    const restaurants = [{ _id: "r1", name: "Test Restaurant" }];
    const orders = [
      {
        _id: "o1",
        status: "confirmed",
        totalAmount: 25.5,
        customer: { name: "John" },
      },
      {
        _id: "o2",
        status: "delivered",
        totalAmount: 30.0,
        customer: { name: "Jane" },
      },
    ];
    const reservations = [
      {
        _id: "res1",
        customer: { name: "John" },
        partySize: 4,
        date: "2026-03-15",
        time: "19:00",
        status: "pending",
      },
    ];

    api.get
      .mockResolvedValueOnce({ data: { data: restaurants } })
      .mockResolvedValueOnce({ data: { data: orders } })
      .mockResolvedValueOnce({ data: { data: reservations } });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders order status buttons", async () => {
    const restaurants = [{ _id: "r1", name: "Test Restaurant" }];
    const orders = [
      {
        _id: "o1",
        status: "pending",
        totalAmount: 25.0,
        customer: { name: "John" },
      },
    ];

    api.get
      .mockResolvedValueOnce({ data: { data: restaurants } })
      .mockResolvedValueOnce({ data: { data: orders } })
      .mockResolvedValueOnce({ data: { data: [] } });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText("preparing")).toBeInTheDocument();
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(screen.getByText("delivered")).toBeInTheDocument();
  });

  it("updates order status on button click", async () => {
    const restaurants = [{ _id: "r1", name: "Test Restaurant" }];
    const orders = [
      {
        _id: "o1",
        status: "pending",
        totalAmount: 25.0,
        customer: { name: "John" },
      },
    ];

    api.get
      .mockResolvedValueOnce({ data: { data: restaurants } })
      .mockResolvedValueOnce({ data: { data: orders } })
      .mockResolvedValueOnce({ data: { data: [] } });
    api.patch.mockResolvedValueOnce({});

    render(<Dashboard />);
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("confirmed")).toBeInTheDocument();
    });
    await user.click(screen.getByText("confirmed"));
    expect(api.patch).toHaveBeenCalledWith("/orders/o1/status", {
      status: "confirmed",
    });
  });
});
