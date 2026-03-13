import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(() => ({ login: mockLogin })),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login heading", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderLogin();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    renderLogin();
    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
  });

  it("renders register link", () => {
    renderLogin();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("shows email validation error on blur with empty email", async () => {
    renderLogin();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    await user.click(emailInput);
    await user.tab();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows email validation error for invalid email", async () => {
    renderLogin();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    await user.type(emailInput, "invalid-email");
    await user.tab();
    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("shows password validation error on blur with empty password", async () => {
    renderLogin();
    const user = userEvent.setup();
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await user.click(passwordInput);
    await user.tab();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows password validation error for weak password", async () => {
    renderLogin();
    const user = userEvent.setup();
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await user.type(passwordInput, "weak");
    await user.tab();
    expect(
      screen.getByText(
        "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
      )
    ).toBeInTheDocument();
  });

  it("does not submit with invalid form", async () => {
    renderLogin();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login and navigates on valid submit", async () => {
    mockLogin.mockResolvedValue({});
    renderLogin();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password1@"
    );
    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "Password1@");
  });

  it("shows error toast on login failure", async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });
    renderLogin();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password1@"
    );
    await user.click(screen.getByRole("button", { name: /login/i }));
    const toast = await import("react-hot-toast");
    expect(toast.default.error).toHaveBeenCalledWith("Invalid credentials");
  });
});
