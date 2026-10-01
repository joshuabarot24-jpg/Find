import { describe, it, expect, beforeEach, vi } from "vitest";
import api, { logoutUser } from "../api";

describe("API Client & Interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.href = "";
    vi.clearAllMocks();
  });

  it("attaches Bearer token in request headers when token exists in localStorage", async () => {
    localStorage.setItem("findnest_token", "sample-token-abc");

    // Interceptor test
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as any };
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe("Bearer sample-token-abc");
  });

  it("does not attach Authorization header when no token is in localStorage", () => {
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as any };
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it("handles 401 error by clearing session and redirecting to landing page on protected routes", async () => {
    localStorage.setItem("findnest_token", "expired-token");
    localStorage.setItem("findnest_user", JSON.stringify({ id: 1 }));

    const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
    const error = {
      config: { url: "/found-items" },
      response: { status: 401 },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(localStorage.removeItem).toHaveBeenCalledWith("findnest_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("findnest_user");
    expect(window.location.href).toBe("/");
  });

  it("does not clear session or redirect to / on 401 from /auth/ login endpoints", async () => {
    localStorage.setItem("findnest_token", "pre-existing-token");
    const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
    const error = {
      config: { url: "/auth/admin/login" },
      response: { status: 401, data: { message: "Invalid credentials" } },
    };

    window.location.href = "/admin-login";
    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(window.location.href).toBe("/admin-login");
  });

  it("logoutUser clears storage and navigates to /", async () => {
    localStorage.setItem("findnest_token", "active-token");
    localStorage.setItem("findnest_user", JSON.stringify({ name: "Admin" }));

    // Mock api.post
    vi.spyOn(api, "post").mockResolvedValueOnce({ data: { success: true } });

    await logoutUser();

    expect(localStorage.removeItem).toHaveBeenCalledWith("findnest_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("findnest_user");
    expect(window.location.href).toBe("/");
  });
});
