import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Menu from "../pages/Menu";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import api from "../services/api";
import useAuth from "../hooks/useAuth";

function renderMenu(user = null) {
  useAuth.mockReturnValue({ user });
  return render(
    <MemoryRouter initialEntries={["/menu/rest1"]}>
      <Routes>
        <Route path="/menu/:restaurantId" element={<Menu />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderMenu();
    expect(screen.getByText("Loading menu...")).toBeInTheDocument();
  });

  it("renders menu items", async () => {
    const items = [
      {
        _id: "i1",
        name: "Burger",
        description: "Juicy beef burger",
        price: 12.99,
        category: "Main",
      },
      {
        _id: "i2",
        name: "Fries",
        description: "Crispy fries",
        price: 4.99,
        category: "Side",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: items } });
    renderMenu();
    await waitFor(() => {
      expect(screen.getByText("Burger")).toBeInTheDocument();
    });
    expect(screen.getByText("Fries")).toBeInTheDocument();
    expect(screen.getByText("Juicy beef burger")).toBeInTheDocument();
  });

  it("shows Add to Cart button for customer role", async () => {
    const items = [
      {
        _id: "i1",
        name: "Burger",
        description: "Juicy beef burger",
        price: 12.99,
        category: "Main",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: items } });
    renderMenu({ name: "John", role: "customer" });
    await waitFor(() => {
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });
  });

  it("does not show Add to Cart button for non-customer", async () => {
    const items = [
      {
        _id: "i1",
        name: "Burger",
        description: "Juicy beef burger",
        price: 12.99,
        category: "Main",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: items } });
    renderMenu({ name: "Owner", role: "owner" });
    await waitFor(() => {
      expect(screen.getByText("Burger")).toBeInTheDocument();
    });
    expect(screen.queryByText("Add to Cart")).not.toBeInTheDocument();
  });

  it("adds item to cart and shows cart section", async () => {
    const items = [
      {
        _id: "i1",
        name: "Burger",
        description: "Juicy beef burger",
        price: 12.99,
        category: "Main",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: items } });
    renderMenu({ name: "John", role: "customer" });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Add to Cart"));
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText(/Burger x1/)).toBeInTheDocument();
    expect(screen.getByText("Place Order")).toBeInTheDocument();
  });

  it("increments quantity when adding same item twice", async () => {
    const items = [
      {
        _id: "i1",
        name: "Burger",
        description: "Juicy beef burger",
        price: 12.99,
        category: "Main",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: items } });
    renderMenu({ name: "John", role: "customer" });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Add to Cart"));
    await user.click(screen.getByText("Add to Cart"));
    expect(screen.getByText(/Burger x2/)).toBeInTheDocument();
  });

  it("places order and clears cart", async () => {
    const items = [
      {
        _id: "i1",
        name: "Burger",
        description: "Juicy beef burger",
        price: 12.99,
        category: "Main",
      },
    ];
    api.get.mockResolvedValueOnce({ data: { data: items } });
    api.post.mockResolvedValueOnce({});
    renderMenu({ name: "John", role: "customer" });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Add to Cart"));
    await user.click(screen.getByText("Place Order"));

    expect(api.post).toHaveBeenCalledWith("/orders", {
      restaurant: "rest1",
      items: [{ menuItem: "i1", quantity: 1, price: 12.99 }],
      totalAmount: 12.99,
    });
    await waitFor(() => {
      expect(screen.queryByText("Cart")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when loading menu fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"));
    renderMenu();
    const toast = await import("react-hot-toast");
    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith("Failed to load menu");
    });
  });
});
