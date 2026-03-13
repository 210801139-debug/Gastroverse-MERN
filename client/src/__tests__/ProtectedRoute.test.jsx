import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(),
}));

import useAuth from "../hooks/useAuth";

function renderWithRoute(authValue, roles) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when loading is true", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    renderWithRoute({ user: null, loading: true }, ["customer"]);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /login when no user", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderWithRoute({ user: null, loading: false }, ["customer"]);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to / when user has wrong role", () => {
    useAuth.mockReturnValue({
      user: { name: "John", role: "customer" },
      loading: false,
    });
    renderWithRoute(
      { user: { name: "John", role: "customer" }, loading: false },
      ["owner"]
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("renders outlet when user has correct role", () => {
    useAuth.mockReturnValue({
      user: { name: "John", role: "customer" },
      loading: false,
    });
    renderWithRoute(
      { user: { name: "John", role: "customer" }, loading: false },
      ["customer"]
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders outlet when no roles restriction is set", () => {
    useAuth.mockReturnValue({
      user: { name: "John", role: "customer" },
      loading: false,
    });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/protected"
              element={<div>Protected Content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
