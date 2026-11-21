import { describe, expect, it } from "vitest";
import { dashboard, scenario, trends } from "./analytics";

describe("frontend analytics", () => {
  it("computes dashboard metrics for demo mode", () => {
    const result = dashboard();
    expect(result.totalWaste).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(50);
  });

  it("builds forecast trend points", () => {
    expect(trends().length).toBeGreaterThan(100);
  });

  it("projects lower landfill in the simulator", () => {
    const result = scenario({ recycling: 15, composting: 50, reduction: 10, plastic: 20, food: 25 });
    expect(result.projectedLandfill).toBeLessThan(result.currentLandfill);
  });
});
