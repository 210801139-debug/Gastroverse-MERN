import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { useContext } from "react";

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from "../services/api";

// Test component that consumes the context
function TestConsumer() {
  const { user, loading, login, register, logout } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <button onClick={() => login("test@test.com", "pass")}>Login</button>
      <button onClick={() => register({ name: "New" })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("provides initial null user when no token", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("fetches user when token exists in localStorage", async () => {
    localStorage.setItem("token", "test-token");
    api.get.mockResolvedValueOnce({
      data: { user: { name: "John", role: "customer" } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("John");
    });
    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("removes token and sets loading false on fetch error", async () => {
    localStorage.setItem("token", "bad-token");
    api.get.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("login sets user and token", async () => {
    api.post.mockResolvedValueOnce({
      data: { token: "new-token", user: { name: "John" } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("John");
    });
    expect(localStorage.getItem("token")).toBe("new-token");
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@test.com",
      password: "pass",
    });
  });

  it("register sets user and token", async () => {
    api.post.mockResolvedValueOnce({
      data: { token: "reg-token", user: { name: "New" } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByText("Register").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("New");
    });
    expect(localStorage.getItem("token")).toBe("reg-token");
  });

  it("logout clears user and token", async () => {
    localStorage.setItem("token", "test-token");
    api.get.mockResolvedValueOnce({
      data: { user: { name: "John" } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("John");
    });

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("token")).toBeNull();
  });
});
