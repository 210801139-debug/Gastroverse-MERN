import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Reservations from "../pages/Reservations";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import api from "../services/api";

describe("Reservations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    render(<Reservations />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders heading and form", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    render(<Reservations />);
    await waitFor(() => {
      expect(screen.getByText("Reservations")).toBeInTheDocument();
    });
    expect(screen.getByText("New Reservation")).toBeInTheDocument();
  });

  it("renders all form fields", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({
        data: {
          data: [{ _id: "r1", name: "Test Restaurant" }],
        },
      });
    render(<Reservations />);
    await waitFor(() => {
      expect(screen.getByText("Restaurant")).toBeInTheDocument();
    });
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Party Size")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("shows no reservations message when empty", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    render(<Reservations />);
    await waitFor(() => {
      expect(screen.getByText("No reservations yet.")).toBeInTheDocument();
    });
  });

  it("renders existing reservations", async () => {
    const reservations = [
      {
        _id: "res1",
        restaurant: { name: "Pizza Place" },
        date: "2026-03-15T00:00:00Z",
        time: "19:00",
        partySize: 4,
        status: "confirmed",
        notes: "Window seat please",
      },
    ];
    api.get
      .mockResolvedValueOnce({ data: { data: reservations } })
      .mockResolvedValueOnce({ data: { data: [] } });
    render(<Reservations />);
    await waitFor(() => {
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });
    expect(screen.getByText(/Party: 4/)).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText("Notes: Window seat please")).toBeInTheDocument();
  });

  it("shows validation errors on blur with empty fields", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    render(<Reservations />);
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getByText("Restaurant")).toBeInTheDocument();
    });
    // Trigger blur on restaurant select
    const restaurantSelect = screen.getByDisplayValue("Select a restaurant");
    await user.click(restaurantSelect);
    await user.tab();
    expect(
      screen.getByText("Please select a restaurant")
    ).toBeInTheDocument();
  });

  it("populates restaurant dropdown", async () => {
    const restaurants = [
      { _id: "r1", name: "Pizza Place" },
      { _id: "r2", name: "Burger Joint" },
    ];
    api.get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: restaurants } });
    render(<Reservations />);
    await waitFor(() => {
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });
    expect(screen.getByText("Burger Joint")).toBeInTheDocument();
    expect(screen.getByText("Select a restaurant")).toBeInTheDocument();
  });

  it("calls correct API endpoints on mount", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });
    render(<Reservations />);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/reservations/my");
      expect(api.get).toHaveBeenCalledWith("/restaurants");
    });
  });
});
