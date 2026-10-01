import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AuthGate from "../AuthGate";

describe("AuthGate Component", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.href = "";
    vi.clearAllMocks();
  });

  it("renders children when valid token and matching role exist", () => {
    localStorage.setItem("findnest_token", "valid-jwt-token");
    localStorage.setItem("findnest_user", JSON.stringify({ id: 1, role: "student", name: "Jane" }));

    render(
      <AuthGate allowedRole="student">
        <div>Protected Student Dashboard</div>
      </AuthGate>
    );

    expect(screen.getByText("Protected Student Dashboard")).toBeInTheDocument();
  });

  it("redirects to landing page when unauthenticated (no token)", () => {
    render(
      <AuthGate allowedRole="admin">
        <div>Protected Admin Dashboard</div>
      </AuthGate>
    );

    expect(window.location.href).toBe("/");
    expect(screen.queryByText("Protected Admin Dashboard")).not.toBeInTheDocument();
  });

  it("redirects to landing page when role mismatches", () => {
    localStorage.setItem("findnest_token", "valid-jwt-token");
    localStorage.setItem("findnest_user", JSON.stringify({ id: 2, role: "student", name: "Jane" }));

    render(
      <AuthGate allowedRole="admin">
        <div>Protected Admin Dashboard</div>
      </AuthGate>
    );

    expect(window.location.href).toBe("/");
    expect(screen.queryByText("Protected Admin Dashboard")).not.toBeInTheDocument();
  });

  it("permits super_admin role when allowedRole is super_admin", () => {
    localStorage.setItem("findnest_token", "superadmin-jwt");
    localStorage.setItem("findnest_user", JSON.stringify({ id: 99, role: "super_admin", name: "Root" }));

    render(
      <AuthGate allowedRole="super_admin">
        <div>Super Admin Console</div>
      </AuthGate>
    );

    expect(screen.getByText("Super Admin Console")).toBeInTheDocument();
  });

  it("redirects when user payload JSON is corrupt", () => {
    localStorage.setItem("findnest_token", "token-123");
    localStorage.setItem("findnest_user", "{invalid-json");

    render(
      <AuthGate allowedRole="student">
        <div>Content</div>
      </AuthGate>
    );

    expect(window.location.href).toBe("/");
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});
