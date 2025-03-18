import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Extend vitest's expect with testing-library matchers
// This adds methods like toBeInTheDocument
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to be in the document`,
    };
  },
});

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
