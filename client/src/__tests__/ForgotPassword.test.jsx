import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

describe("ForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password heading", () => {
    renderForgotPassword();
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
  });

  it("renders email input and submit button", () => {
    renderForgotPassword();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    renderForgotPassword();
    expect(
      screen.getByText(
        /enter your email and we'll send you a link to reset your password/i
      )
    ).toBeInTheDocument();
  });

  it("renders login link", () => {
    renderForgotPassword();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("shows validation error on blur with empty email", async () => {
    renderForgotPassword();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    await user.click(emailInput);
    await user.tab();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    renderForgotPassword();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "invalid"
    );
    await user.tab();
    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("does not submit with empty email", async () => {
    renderForgotPassword();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.queryByText("Back to Login")).not.toBeInTheDocument();
  });

  it("shows success message after valid submission", async () => {
    renderForgotPassword();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(
      screen.getByText(/you will receive a password reset link shortly/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });

  it("shows the email in success message", async () => {
    renderForgotPassword();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
