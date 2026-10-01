"use client";
import { useState, useLayoutEffect, ReactNode } from "react";

interface AuthGateProps {
  allowedRole: "super_admin" | "admin" | "student";
  children: ReactNode;
}

let verifiedRoleThisSession: string | null = null;

function isAuthorized(allowedRole: string): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("findnest_token");
  const userStr = localStorage.getItem("findnest_user");
  if (!token || !userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === allowedRole;
  } catch {
    return false;
  }
}

export default function AuthGate({ allowedRole, children }: AuthGateProps) {
  const [status, setStatus] = useState<"checking" | "ok">(() => {
    if (verifiedRoleThisSession === allowedRole || isAuthorized(allowedRole)) {
      verifiedRoleThisSession = allowedRole;
      return "ok";
    }
    return "checking";
  });

  useLayoutEffect(() => {
    if (!isAuthorized(allowedRole)) {
      verifiedRoleThisSession = null;
      window.location.href = "/";
      return;
    }
    verifiedRoleThisSession = allowedRole;
    if (status !== "ok") {
      setStatus("ok");
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "findnest_token" || e.key === "findnest_user") {
        if (!isAuthorized(allowedRole)) {
          verifiedRoleThisSession = null;
          window.location.href = "/";
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const remembered = localStorage.getItem("findnest_remember_me") === "true";
        if (!remembered) {
          verifiedRoleThisSession = null;
          localStorage.removeItem("findnest_token");
          localStorage.removeItem("findnest_user");
          window.location.href = "/";
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    const handlePopState = () => {
      const remembered = localStorage.getItem("findnest_remember_me") === "true";
      if (!remembered) {
        verifiedRoleThisSession = null;
        localStorage.removeItem("findnest_token");
        localStorage.removeItem("findnest_user");
        window.location.href = "/";
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [allowedRole, status]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1a237e]/20 border-t-[#1a237e] rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}