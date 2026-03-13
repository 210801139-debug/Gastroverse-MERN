import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

const mockLogout = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(),
}));

import useAuth from "../hooks/useAuth";

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the brand link", () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderNavbar();
    expect(screen.getByText("Gastroverse")).toBeInTheDocument();
  });

  it("renders Restaurants link", () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderNavbar();
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
  });

  it("shows Login and Register links when no user", () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderNavbar();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("shows user name and Logout when user is logged in", () => {
    useAuth.mockReturnValue({
      user: { name: "John", role: "customer" },
      logout: mockLogout,
    });
    renderNavbar();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("shows My Orders and Reservations links for customer role", () => {
    useAuth.mockReturnValue({
      user: { name: "John", role: "customer" },
      logout: mockLogout,
    });
    renderNavbar();
    expect(screen.getByText("My Orders")).toBeInTheDocument();
    expect(screen.getByText("Reservations")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("shows Dashboard link for owner role", () => {
    useAuth.mockReturnValue({
      user: { name: "Owner", role: "owner" },
      logout: mockLogout,
    });
    renderNavbar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("My Orders")).not.toBeInTheDocument();
  });

  it("calls logout when Logout button is clicked", async () => {
    useAuth.mockReturnValue({
      user: { name: "John", role: "customer" },
      logout: mockLogout,
    });
    renderNavbar();
    const user = userEvent.setup();
    await user.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
