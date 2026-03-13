import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(() => ({ register: mockRegister })),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders register heading", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    renderRegister();
    expect(
      screen.getByPlaceholderText("Enter your full name")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g. +1 (555) 123-4567")
    ).toBeInTheDocument();
  });

  it("renders role select with Customer and Restaurant Owner options", () => {
    renderRegister();
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Restaurant Owner")).toBeInTheDocument();
  });

  it("renders login link", () => {
    renderRegister();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("shows name validation error on blur with empty name", async () => {
    renderRegister();
    const user = userEvent.setup();
    const nameInput = screen.getByPlaceholderText("Enter your full name");
    await user.click(nameInput);
    await user.tab();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("shows name validation error for invalid name", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Enter your full name"), "A");
    await user.tab();
    expect(
      screen.getByText("Name must be 2-50 letters only")
    ).toBeInTheDocument();
  });

  it("shows email validation error for invalid email", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "not-email"
    );
    await user.tab();
    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("shows password validation error for weak password", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "weak"
    );
    await user.tab();
    expect(
      screen.getByText(
        "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
      )
    ).toBeInTheDocument();
  });

  it("shows phone validation error for invalid phone", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("e.g. +1 (555) 123-4567"),
      "abc"
    );
    await user.tab();
    expect(
      screen.getByText("Please enter a valid phone number")
    ).toBeInTheDocument();
  });

  it("does not submit with invalid form", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register on valid submit", async () => {
    mockRegister.mockResolvedValue({});
    renderRegister();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Enter your full name"),
      "John Doe"
    );
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password1@"
    );
    await user.type(
      screen.getByPlaceholderText("e.g. +1 (555) 123-4567"),
      "+1234567890"
    );
    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(mockRegister).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "Password1@",
      role: "customer",
      phone: "+1234567890",
    });
  });

  it("shows error toast on registration failure", async () => {
    mockRegister.mockRejectedValue({
      response: { data: { message: "Email already exists" } },
    });
    renderRegister();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Enter your full name"),
      "John Doe"
    );
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "john@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password1@"
    );
    await user.click(screen.getByRole("button", { name: /register/i }));
    const toast = await import("react-hot-toast");
    expect(toast.default.error).toHaveBeenCalledWith("Email already exists");
  });
});
