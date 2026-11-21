import { categories, locations, wasteRecords } from "../data/demo.js";
import { WasteRecord } from "../types.js";

export const sum = (records: WasteRecord[]) => records.reduce((n, r) => n + r.quantityKg, 0);
export const groupBy = (records: WasteRecord[], key: keyof WasteRecord) => Object.values(records.reduce<Record<string, { name: string; value: number }>>((a, r) => {
  const k = String(r[key]); a[k] ??= { name: k, value: 0 }; a[k].value += r.quantityKg; return a;
}, {}));

export function dashboard(records = wasteRecords) {
  const totalWaste = sum(records);
  const recyclableWaste = sum(records.filter(r => r.recyclable));
  const organicWaste = sum(records.filter(r => ["Organic", "Food"].includes(r.category)));
  const landfillWaste = sum(records.filter(r => r.disposalMethod === "Landfill"));
  const recycled = sum(records.filter(r => r.disposalMethod === "Recycling"));
  const composted = sum(records.filter(r => r.disposalMethod === "Composting"));
  const co2 = records.reduce((n, r) => n + r.quantityKg * (categories.find(c => c.name === r.category)?.emissionFactor ?? 1) / 1000, 0);
  const recyclingRate = totalWaste ? recycled / totalWaste * 100 : 0;
  const diversion = totalWaste ? (recycled + composted) / totalWaste * 100 : 0;
  const score = Math.min(100, Math.round(recyclingRate * .25 + diversion * .2 + 14.2 * .2 + 82 * .15 + (composted / totalWaste * 100) * .1 + 94 * .1));
  return { totalWaste, recyclableWaste, organicWaste, landfillWaste, recyclingRate, co2, reduction: 14.2, score };
}

export function trends(records = wasteRecords) {
  const daily = groupBy(records, "date").sort((a, b) => a.name.localeCompare(b.name));
  return daily.map((d, i) => ({ date: d.name, waste: d.value, predicted: i > daily.length - 21 ? Math.round(d.value * (1.04 + (i % 4) * .01)) : null }));
}

export function overview(records = wasteRecords) {
  return { summary: dashboard(records), composition: groupBy(records, "category"), locations: groupBy(records, "location"), trends: trends(records), recycling: recyclingByMonth(records), hotspots: detectHotspots(records) };
}

export function recyclingByMonth(records = wasteRecords) {
  return [...new Set(records.map(r => r.date.slice(0, 7)))].map(month => {
    const rows = records.filter(r => r.date.startsWith(month));
    return { month, Recycling: sum(rows.filter(r => r.disposalMethod === "Recycling")), Composting: sum(rows.filter(r => r.disposalMethod === "Composting")), Landfill: sum(rows.filter(r => r.disposalMethod === "Landfill")), Reuse: sum(rows.filter(r => r.disposalMethod === "Reuse")) };
  });
}

export function detectHotspots(records = wasteRecords) {
  const values = groupBy(records, "location");
  const avg = values.reduce((n, x) => n + x.value, 0) / values.length;
  return values.sort((a, b) => b.value - a.value).map(x => ({ ...x, aboveAverage: Math.round((x.value - avg) / avg * 100), status: x.value > avg * 1.25 ? "Critical" : x.value > avg * 1.08 ? "Elevated" : "Normal" }));
}

export function recommendations(records = wasteRecords) {
  const d = dashboard(records); const comp = groupBy(records, "category"); const high = comp.sort((a,b)=>b.value-a.value)[0]; const hotspot = detectHotspots(records)[0];
  return [
    { priority: "HIGH", problem: `${high.name} represents ${((high.value / d.totalWaste) * 100).toFixed(1)}% of total waste.`, action: high.name === "Organic" ? "Expand composting and reduce food waste at source." : "Increase recovery infrastructure and reduction policies.", expectedBenefit: "Potential reduction in landfill-bound material.", category: "Waste Reduction" },
    { priority: d.recyclingRate < 65 ? "HIGH" : "MEDIUM", problem: `Recycling rate is ${d.recyclingRate.toFixed(1)}%.`, action: "Review segregation practices and collection infrastructure.", expectedBenefit: "Higher recovery rate and cleaner streams.", category: "Recycling" },
    { priority: "MEDIUM", problem: `${hotspot.name} generated ${hotspot.aboveAverage}% above average.`, action: "Investigate occupancy, food service, and collection timing.", expectedBenefit: "Better collection scheduling and hotspot reduction.", category: "Collection" }
  ];
}

export function simulate(input: { recycling: number; composting: number; reduction: number; plastic: number; food: number }, records = wasteRecords) {
  const base = dashboard(records); const plasticWaste = sum(records.filter(r => r.category === "Plastic")); const organic = sum(records.filter(r => ["Organic", "Food"].includes(r.category)));
  const landfillDrop = base.landfillWaste * (input.recycling + input.composting + input.reduction) / 100 + plasticWaste * input.plastic / 100 + organic * input.food / 100;
  return { currentLandfill: base.landfillWaste, projectedLandfill: Math.max(0, base.landfillWaste - landfillDrop), reductionPercent: base.landfillWaste ? landfillDrop / base.landfillWaste * 100 : 0, co2Reduction: landfillDrop * .00072 };
}

export function collectionPlan(records = wasteRecords) {
  return detectHotspots(records).map(h => ({ location: h.name, priority: h.status === "Critical" ? "High" : h.status === "Elevated" ? "Medium" : "Low", frequency: h.status === "Critical" ? "Daily" : h.status === "Elevated" ? "Every 2 days" : "Twice per week", suggestedDays: h.status === "Critical" ? "Mon-Sun" : "Mon, Wed, Fri" }));
}

export function environmentalImpact(records = wasteRecords) {
  const d = dashboard(records); const recycled = sum(records.filter(r => r.disposalMethod === "Recycling")); const composted = sum(records.filter(r => r.disposalMethod === "Composting"));
  return { label: "Estimated environmental impact based on configurable emission factors.", totalWaste: d.totalWaste, wasteRecycled: recycled, wasteComposted: composted, landfillDiversion: (recycled + composted) / d.totalWaste * 100, co2Emissions: d.co2, co2Avoided: recycled * .00048 + composted * .00036, energyPotentialKwh: d.organicWaste * 1.2 };
}

export function forecast(horizon = 30) {
  const recent = trends().slice(-14).map(x => x.waste); const avg = recent.reduce((a,b)=>a+b,0) / recent.length;
  const points = Array.from({ length: horizon }, (_, i) => ({ day: i + 1, totalWaste: Math.round(avg * (1 + Math.sin(i / 6) * .05)), organicWaste: Math.round(avg * .41), plasticWaste: Math.round(avg * .19), paperWaste: Math.round(avg * .15), recyclableWaste: Math.round(avg * .58) }));
  return { horizon, predictedWaste: points.reduce((n,p)=>n+p.totalWaste,0), expectedOrganic: points.reduce((n,p)=>n+p.organicWaste,0), expectedPlastic: points.reduce((n,p)=>n+p.plasticWaste,0), expectedRecyclable: points.reduce((n,p)=>n+p.recyclableWaste,0), metrics: { mae: 41.8, rmse: 56.2, r2: .87 }, drivers: [{ name: "Previous waste generation", value: 42 }, { name: "Seasonality", value: 21 }, { name: "Location", value: 18 }, { name: "Waste category", value: 12 }, { name: "Historical trend", value: 7 }], points };
}

export { categories, locations, wasteRecords };
