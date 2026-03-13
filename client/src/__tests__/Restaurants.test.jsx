import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Restaurants from "../pages/Restaurants";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from "../services/api";

function renderRestaurants() {
  return render(
    <MemoryRouter>
      <Restaurants />
    </MemoryRouter>
  );
}

describe("Restaurants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderRestaurants();
    expect(screen.getByText("Loading restaurants...")).toBeInTheDocument();
  });

  it("shows no restaurants message when empty", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByText("No restaurants found.")).toBeInTheDocument();
    });
  });

  it("renders restaurants list", async () => {
    const restaurants = [
      {
        _id: "r1",
        name: "Pizza Place",
        cuisine: ["Italian", "Pizza"],
        description: "Best pizza in town",
      },
      {
        _id: "r2",
        name: "Burger Joint",
        cuisine: ["American"],
        description: "Gourmet burgers",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: restaurants } });
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByText("Pizza Place")).toBeInTheDocument();
    });
    expect(screen.getByText("Burger Joint")).toBeInTheDocument();
    expect(screen.getByText("Italian, Pizza")).toBeInTheDocument();
    expect(screen.getByText("Best pizza in town")).toBeInTheDocument();
  });

  it("renders View Menu links", async () => {
    const restaurants = [
      {
        _id: "r1",
        name: "Pizza Place",
        cuisine: ["Italian"],
        description: "Best pizza",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: restaurants } });
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByText("View Menu")).toBeInTheDocument();
    });
    const link = screen.getByText("View Menu");
    expect(link.closest("a")).toHaveAttribute("href", "/menu/r1");
  });

  it("renders heading", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByText("Restaurants")).toBeInTheDocument();
    });
  });

  it("calls the correct API endpoint", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    renderRestaurants();
    expect(api.get).toHaveBeenCalledWith("/restaurants");
  });
});
