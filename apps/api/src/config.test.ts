import { describe, it, expect } from "vitest";
import { config } from "./config.js";

describe("config", () => {
  it("loads the test database URL when running under Vitest", () => {
    expect(config.DATABASE_URL).toContain("release_ready_test");
  });
});