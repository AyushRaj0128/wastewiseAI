import { WasteCategory, WasteRecord, Recommendation } from "../types";

export const categories: WasteCategory[] = [
  { id: "organic", name: "Organic", description: "Food and plant waste", recyclable: false, compostable: true, hazardous: false, emissionFactor: .58, disposalMethod: "Composting" },
  { id: "food", name: "Food", description: "Prepared food leftovers", recyclable: false, compostable: true, hazardous: false, emissionFactor: .62, disposalMethod: "Composting" },
  { id: "plastic", name: "Plastic", description: "Rigid and flexible plastics", recyclable: true, compostable: false, hazardous: false, emissionFactor: 1.82, disposalMethod: "Recycling" },
  { id: "paper", name: "Paper", description: "Office and academic paper", recyclable: true, compostable: false, hazardous: false, emissionFactor: .74, disposalMethod: "Recycling" },
  { id: "cardboard", name: "Cardboard", description: "Packaging board", recyclable: true, compostable: false, hazardous: false, emissionFactor: .62, disposalMethod: "Recycling" },
  { id: "glass", name: "Glass", description: "Glass containers", recyclable: true, compostable: false, hazardous: false, emissionFactor: .32, disposalMethod: "Recycling" },
  { id: "metal", name: "Metal", description: "Ferrous and non-ferrous metal", recyclable: true, compostable: false, hazardous: false, emissionFactor: .24, disposalMethod: "Recycling" },
  { id: "e-waste", name: "E-waste", description: "Electronics and accessories", recyclable: true, compostable: false, hazardous: true, emissionFactor: 2.4, disposalMethod: "Other" },
  { id: "textile", name: "Textile", description: "Clothing and fabric", recyclable: true, compostable: false, hazardous: false, emissionFactor: 1.1, disposalMethod: "Reuse" },
  { id: "hazardous", name: "Hazardous", description: "Chemicals and contaminated waste", recyclable: false, compostable: false, hazardous: true, emissionFactor: 3.1, disposalMethod: "Other" },
  { id: "other", name: "Other", description: "Mixed residual waste", recyclable: false, compostable: false, hazardous: false, emissionFactor: 1.2, disposalMethod: "Landfill" }
];

export const locations = ["Academic Block", "Hostel Block A", "Hostel Block B", "Food Court", "Administration Block", "Sports Complex"];
const sourceByLocation = ["College", "College", "Residential", "Commercial", "Institutional", "College"] as const;

export const wasteRecords: WasteRecord[] = Array.from({ length: 180 }).flatMap((_, day) => {
  const date = new Date(2026, 0, 1 + day).toISOString().slice(0, 10);
  return locations.flatMap((location, l) => categories.slice(0, 7).map((category, c) => {
    const weekend = new Date(date).getDay() % 6 === 0 ? .78 : 1;
    const hotspot = location === "Food Court" && ["Organic", "Food", "Plastic"].includes(category.name) ? 1.75 : 1;
    const hostel = location.includes("Hostel") && ["Organic", "Plastic"].includes(category.name) ? 1.35 : 1;
    const seasonal = 1 + Math.sin((day / 180) * Math.PI * 2) * .12;
    const base = [44, 26, 18, 21, 13, 7, 5][c] * (1 + l * .08);
    const quantityKg = Math.round(base * weekend * hotspot * hostel * seasonal + ((day + c + l) % 9));
    const disposalMethod = category.compostable ? "Composting" : category.recyclable && (day + l) % 5 !== 0 ? "Recycling" : "Landfill";
    return { id: `${date}-${location}-${category.name}`, date, location, category: category.name, quantityKg, source: sourceByLocation[l], disposalMethod, recyclable: category.recyclable, notes: "Synthetic demo record" };
  }));
});

export const recommendations: Recommendation[] = [
  { priority: "HIGH", problem: "Organic waste is concentrated in Food Court and hostels.", action: "Expand source-segregated composting and add food-waste nudges at serving points.", expectedBenefit: "Lower landfill dependency and avoided methane emissions.", category: "Waste Reduction" },
  { priority: "HIGH", problem: "Plastic represents a material share of landfill-bound waste.", action: "Introduce reusable alternatives and increase plastic collection points.", expectedBenefit: "Higher recycling recovery and lower residual waste.", category: "Recycling" },
  { priority: "MEDIUM", problem: "Hostel Block A remains above the location average.", action: "Audit occupancy-linked waste and adjust collection frequency.", expectedBenefit: "Better bin capacity planning and fewer overflow events.", category: "Collection" },
  { priority: "LOW", problem: "Paper recovery is steady but can improve.", action: "Deploy paper-only bins near academic offices and print zones.", expectedBenefit: "Cleaner recyclable stream and lower contamination.", category: "Segregation" }
];
