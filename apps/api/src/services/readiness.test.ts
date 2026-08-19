import { describe, it, expect } from "vitest";
import { checkReadiness, type ReadinessInput } from "./readiness.js";

const readyInput: ReadinessInput = {
  title: "Test Release",
  upc: "123456789012",
  tracks: [{ id: 1, isrc: "USRC17654321", splitPercents: [60, 40] }],
};

describe("checkReadiness", () => {
  it("passes with no failures when everything is valid", () => {
    expect(checkReadiness(readyInput)).toHaveLength(0);
  });

  it("flags a missing title", () => {
    const failures = checkReadiness({ ...readyInput, title: null });
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe("missing_title");
  });

  it("flags a missing upc", () => {
    const failures = checkReadiness({ ...readyInput, upc: null });
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe("missing_upc");
  });

  it("flags missing tracks", () => {
    const failures = checkReadiness({ ...readyInput, tracks: [] });
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe("missing_tracks");
  });

  it("flags missing isrc", () => {
    const failures = checkReadiness({
      ...readyInput,
      tracks: [{ id: 1, isrc: null, splitPercents: [60, 40] }],
    });
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe("missing_isrc");
  });

  it("flags missing contributors", () => {
    const failures = checkReadiness({
      ...readyInput,
      tracks: [{ id: 1, isrc: "123456789012", splitPercents: [] }],
    });
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe("no_contributors_listed");
  });

  it("flags splits don't add up to 100", () => {
    const failures = checkReadiness({
      ...readyInput,
      tracks: [{ id: 1, isrc: "123456789012", splitPercents: [60, 20] }],
    });
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe("splits_not_100");
  });
});
