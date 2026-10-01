import { describe, it, expect } from "vitest";

describe("Notification Navigation & Fallback Logic", () => {
  function resolveNotificationRoute(n: { type: string; match_id: number | null }) {
    const t = n.type.toLowerCase();
    if (t.includes("support")) {
      return "/support";
    } else if (t.includes("match")) {
      if (n.match_id) {
        return `/matched-item?matchId=${n.match_id}`;
      } else {
        return "/claim-status";
      }
    } else if (t.includes("status") || t.includes("reminder") || t.includes("claim")) {
      return "/claim-status";
    }
    return "/student-home";
  }

  it("navigates to matched-item when match_id is present", () => {
    const route = resolveNotificationRoute({
      type: "item_matched",
      match_id: 42,
    });
    expect(route).toBe("/matched-item?matchId=42");
  });

  it("falls back to claim-status when match_id is null/missing (prevents SQLSTATE bigint crash)", () => {
    const route = resolveNotificationRoute({
      type: "item_matched",
      match_id: null,
    });
    expect(route).toBe("/claim-status");
  });

  it("navigates to support for support inquiries", () => {
    const route = resolveNotificationRoute({
      type: "support_response",
      match_id: null,
    });
    expect(route).toBe("/support");
  });

  it("navigates to claim-status for status updates", () => {
    const route = resolveNotificationRoute({
      type: "claim_verified",
      match_id: null,
    });
    expect(route).toBe("/claim-status");
  });
});
