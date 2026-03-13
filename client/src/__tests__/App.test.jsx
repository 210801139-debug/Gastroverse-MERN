import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(() => ({ user: null, loading: false, logout: vi.fn() })),
}));

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    post: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
  default: { success: vi.fn(), error: vi.fn() },
}));

import useAuth from "../hooks/useAuth";

describe("App", () => {
  it("renders Home page on / route", () => {
    useAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText("Welcome to Gastroverse")).toBeInTheDocument();
  });

  it("renders Navbar on non-auth pages", () => {
    useAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText("Gastroverse")).toBeInTheDocument();
  });

  it("does not render Navbar on /login", () => {
    useAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.queryByText("Gastroverse")).not.toBeInTheDocument();
  });

  it("does not render Navbar on /register", () => {
    useAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.queryByText("Gastroverse")).not.toBeInTheDocument();
  });

  it("renders the Toaster component", () => {
    useAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });
});
