import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock window.location
delete (window as any).location;
window.location = {
  href: "",
  pathname: "/",
  search: "",
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
} as any;
