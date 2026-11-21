import { WasteCategory, WasteRecord, User, Dataset } from "../types.js";
import bcrypt from "bcryptjs";

export const categories: WasteCategory[] = [
  ["organic","Organic","Food and plant waste",false,true,false,.58,"Composting"],["food","Food","Prepared food leftovers",false,true,false,.62,"Composting"],["plastic","Plastic","Rigid and flexible plastics",true,false,false,1.82,"Recycling"],["paper","Paper","Office and academic paper",true,false,false,.74,"Recycling"],["cardboard","Cardboard","Packaging board",true,false,false,.62,"Recycling"],["glass","Glass","Glass containers",true,false,false,.32,"Recycling"],["metal","Metal","Ferrous and non-ferrous metal",true,false,false,.24,"Recycling"],["e-waste","E-waste","Electronics and accessories",true,false,true,2.4,"Other"],["textile","Textile","Clothing and fabric",true,false,false,1.1,"Reuse"],["hazardous","Hazardous","Chemicals and contaminated waste",false,false,true,3.1,"Other"],["other","Other","Mixed residual waste",false,false,false,1.2,"Landfill"]
].map(([id,name,description,recyclable,compostable,hazardous,emissionFactor,disposalMethod]) => ({ id, name, description, recyclable, compostable, hazardous, emissionFactor, disposalMethod } as WasteCategory));

export const locations = ["Academic Block", "Hostel Block A", "Hostel Block B", "Food Court", "Administration Block", "Sports Complex"];
const sourceByLocation = ["College", "College", "Residential", "Commercial", "Institutional", "College"] as const;

export const wasteRecords: WasteRecord[] = Array.from({ length: 180 }).flatMap((_, day) => {
  const date = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10);
  return locations.flatMap((location, l) => categories.slice(0, 7).map((category, c) => {
    const weekend = new Date(date).getUTCDay() % 6 === 0 ? .78 : 1;
    const hotspot = location === "Food Court" && ["Organic", "Food", "Plastic"].includes(category.name) ? 1.75 : 1;
    const hostel = location.includes("Hostel") && ["Organic", "Plastic"].includes(category.name) ? 1.35 : 1;
    const seasonal = 1 + Math.sin((day / 180) * Math.PI * 2) * .12;
    const base = [44, 26, 18, 21, 13, 7, 5][c] * (1 + l * .08);
    const quantityKg = Math.round(base * weekend * hotspot * hostel * seasonal + ((day + c + l) % 9));
    const disposalMethod = category.compostable ? "Composting" : category.recyclable && (day + l) % 5 !== 0 ? "Recycling" : "Landfill";
    return { id: `${date}-${location}-${category.name}`, date, location, category: category.name, quantityKg, source: sourceByLocation[l], disposalMethod, recyclable: category.recyclable, notes: "Synthetic demo record", createdAt: date, updatedAt: date };
  }));
});

const passwordHash = bcrypt.hashSync("Password123!", 10);
export const users: User[] = [
  { id: "u-admin", name: "Asha Admin", email: "admin@wastewise.ai", passwordHash, role: "ADMIN", organization: "WasteWise Demo Campus", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "u-analyst", name: "Nikhil Analyst", email: "analyst@wastewise.ai", passwordHash, role: "ANALYST", organization: "WasteWise Demo Campus", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "u-viewer", name: "Vera Viewer", email: "viewer@wastewise.ai", passwordHash, role: "VIEWER", organization: "WasteWise Demo Campus", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export const datasets: Dataset[] = [{ id: "demo-six-months", name: "Synthetic campus waste baseline", rows: wasteRecords.length, dateRange: "2026-01-01 to 2026-06-29", categories: categories.map(c => c.name), locations, quality: { completeness: 94, validity: 97, duplicates: 2, missingValues: 6 }, createdAt: new Date().toISOString() }];
