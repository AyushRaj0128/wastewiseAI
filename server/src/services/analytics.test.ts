import { describe, expect, it } from "vitest";
import { dashboard, forecast, recommendations, simulate, wasteRecords } from "./analytics.js";

describe("analytics", () => {
  it("calculates dashboard metrics", () => {
    const d = dashboard(wasteRecords);
    expect(d.totalWaste).toBeGreaterThan(0);
    expect(d.score).toBeGreaterThan(0);
  });
  it("returns forecast points", () => {
    expect(forecast(7).points).toHaveLength(7);
  });
  it("simulates lower landfill", () => {
    const out = simulate({ recycling: 15, composting: 40, reduction: 10, plastic: 20, food: 20 }, wasteRecords);
    expect(out.projectedLandfill).toBeLessThan(out.currentLandfill);
  });
  it("creates recommendations", () => {
    expect(recommendations(wasteRecords).length).toBeGreaterThan(0);
  });
});
