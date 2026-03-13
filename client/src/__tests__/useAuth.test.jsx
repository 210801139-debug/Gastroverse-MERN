import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthContext } from "../context/AuthContext";
import useAuth from "../hooks/useAuth";

describe("useAuth", () => {
  it("throws error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });

  it("returns context value when used within AuthProvider", () => {
    const mockValue = {
      user: { name: "John", role: "customer" },
      loading: false,
      login: () => {},
      register: () => {},
      logout: () => {},
    };

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual({ name: "John", role: "customer" });
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });
});
