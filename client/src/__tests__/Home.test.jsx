import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../pages/Home";

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(),
}));

import useAuth from "../hooks/useAuth";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome heading", () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    expect(screen.getByText("Welcome to Gastroverse")).toBeInTheDocument();
  });

  it("renders description text", () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    expect(
      screen.getByText(
        "Discover restaurants, reserve tables, and order your favorite meals."
      )
    ).toBeInTheDocument();
  });

  it("shows Browse Restaurants link", () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    expect(screen.getByText("Browse Restaurants")).toBeInTheDocument();
  });

  it('shows "Get Started" when no user is logged in', () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it('shows "Dashboard" when user is logged in', () => {
    useAuth.mockReturnValue({ user: { name: "John", role: "owner" } });
    renderHome();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Get Started")).not.toBeInTheDocument();
  });

  it("links Get Started to /register for unauthenticated users", () => {
    useAuth.mockReturnValue({ user: null });
    renderHome();
    const link = screen.getByText("Get Started");
    expect(link.closest("a")).toHaveAttribute("href", "/register");
  });

  it("links Dashboard to /dashboard for authenticated users", () => {
    useAuth.mockReturnValue({ user: { name: "John", role: "owner" } });
    renderHome();
    const link = screen.getByText("Dashboard");
    expect(link.closest("a")).toHaveAttribute("href", "/dashboard");
  });
});
