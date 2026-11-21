import { categories, locations, recommendations, wasteRecords } from "../data/demoData";
import { WasteRecord } from "../types";

export const sum = (records: WasteRecord[]) => records.reduce((n, r) => n + r.quantityKg, 0);
export const by = (records: WasteRecord[], key: keyof WasteRecord) => Object.values(records.reduce<Record<string, { name: string; value: number }>>((a, r) => {
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
  const score = Math.round(recyclingRate * .25 + diversion * .2 + 14.2 * .2 + 82 * .15 + (composted / totalWaste * 100) * .1 + 94 * .1);
  return { totalWaste, recyclableWaste, organicWaste, landfillWaste, recyclingRate, co2, reduction: 14.2, score: Math.min(100, score) };
}

export function trends(records = wasteRecords) {
  const daily = by(records, "date").sort((a, b) => a.name.localeCompare(b.name));
  return daily.map((d, i) => ({ date: d.name.slice(5), waste: d.value, predicted: i > daily.length - 21 ? Math.round(d.value * (1.04 + (i % 4) * .01)) : undefined }));
}

export function recyclingByMonth(records = wasteRecords) {
  const months = [...new Set(records.map(r => r.date.slice(0, 7)))];
  return months.map(month => {
    const rows = records.filter(r => r.date.startsWith(month));
    return { month, Recycling: sum(rows.filter(r => r.disposalMethod === "Recycling")), Composting: sum(rows.filter(r => r.disposalMethod === "Composting")), Landfill: sum(rows.filter(r => r.disposalMethod === "Landfill")) };
  });
}

export function hotspots(records = wasteRecords) {
  const values = by(records, "location");
  const avg = values.reduce((n, x) => n + x.value, 0) / values.length;
  return values.sort((a, b) => b.value - a.value).map(x => ({ ...x, aboveAverage: Math.round((x.value - avg) / avg * 100), status: x.value > avg * 1.25 ? "Critical" : x.value > avg * 1.08 ? "Elevated" : "Normal" }));
}

export function scenario(input: { recycling: number; composting: number; reduction: number; plastic: number; food: number }, records = wasteRecords) {
  const base = dashboard(records);
  const plasticWaste = sum(records.filter(r => r.category === "Plastic"));
  const organic = sum(records.filter(r => ["Organic", "Food"].includes(r.category)));
  const landfillDrop = base.landfillWaste * (input.recycling + input.composting + input.reduction) / 100 + plasticWaste * input.plastic / 100 + organic * input.food / 100;
  const projectedLandfill = Math.max(0, base.landfillWaste - landfillDrop);
  const co2Reduction = landfillDrop * .00072;
  return { projectedLandfill, reductionPercent: base.landfillWaste ? (landfillDrop / base.landfillWaste) * 100 : 0, co2Reduction, currentLandfill: base.landfillWaste, currentCo2: base.co2 };
}

export function collectionPlan(records = wasteRecords) {
  return hotspots(records).map(h => ({ location: h.name, priority: h.status === "Critical" ? "High" : h.status === "Elevated" ? "Medium" : "Low", frequency: h.status === "Critical" ? "Daily" : h.status === "Elevated" ? "Every 2 days" : "Twice per week", suggestedDays: h.status === "Critical" ? "Mon-Sun" : "Mon, Wed, Fri" }));
}

export const demo = { categories, locations, wasteRecords, recommendations };
