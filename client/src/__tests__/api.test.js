import { describe, it, expect, vi, beforeEach } from "vitest";

// Must mock axios before importing api
vi.mock("axios", () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  return {
    default: {
      create: vi.fn(() => ({
        interceptors,
        get: vi.fn(),
        post: vi.fn(),
      })),
    },
  };
});

import axios from "axios";

describe("api service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it("creates axios instance with correct config", async () => {
    await import("../services/api");
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String),
      headers: { "Content-Type": "application/json" },
    });
  });

  it("registers request interceptor", async () => {
    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    expect(instance.interceptors.request.use).toHaveBeenCalled();
  });

  it("registers response interceptor", async () => {
    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    expect(instance.interceptors.response.use).toHaveBeenCalled();
  });

  it("request interceptor adds token when present", async () => {
    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    const requestInterceptor =
      instance.interceptors.request.use.mock.calls[0][0];

    localStorage.setItem("token", "test-token");
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe("Bearer test-token");
  });

  it("request interceptor does not add token when absent", async () => {
    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    const requestInterceptor =
      instance.interceptors.request.use.mock.calls[0][0];

    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("response interceptor passes through successful responses", async () => {
    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    const successHandler = instance.interceptors.response.use.mock.calls[0][0];

    const response = { data: "test" };
    expect(successHandler(response)).toBe(response);
  });

  it("response interceptor handles 401 errors", async () => {
    localStorage.setItem("token", "old-token");
    const originalHref = window.location.href;

    // Mock window.location
    delete window.location;
    window.location = { href: "" };

    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    const errorHandler = instance.interceptors.response.use.mock.calls[0][1];

    const error = { response: { status: 401 } };
    await expect(errorHandler(error)).rejects.toBe(error);
    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/login");

    // Restore
    window.location.href = originalHref;
  });

  it("response interceptor rejects non-401 errors", async () => {
    await import("../services/api");
    const instance = axios.create.mock.results[0].value;
    const errorHandler = instance.interceptors.response.use.mock.calls[0][1];

    const error = { response: { status: 500 } };
    await expect(errorHandler(error)).rejects.toBe(error);
  });
});
