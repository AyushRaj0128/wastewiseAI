export type Role = "ADMIN" | "ANALYST" | "VIEWER";
export type DisposalMethod = "Recycling" | "Composting" | "Reuse" | "Landfill" | "Incineration" | "Other";
export type Source = "Residential" | "Commercial" | "Industrial" | "Institutional" | "College" | "Municipal";

export interface User { id: string; name: string; email: string; role: Role; organization: string; }
export interface WasteCategory { id: string; name: string; description: string; recyclable: boolean; compostable: boolean; hazardous: boolean; emissionFactor: number; disposalMethod: DisposalMethod; }
export interface WasteRecord { id: string; date: string; location: string; category: string; quantityKg: number; source: Source; disposalMethod: DisposalMethod; recyclable: boolean; notes?: string; }
export interface Recommendation { priority: "HIGH" | "MEDIUM" | "LOW"; problem: string; action: string; expectedBenefit: string; category: string; }
export interface DashboardData { totalWaste: number; recyclableWaste: number; organicWaste: number; landfillWaste: number; recyclingRate: number; co2: number; reduction: number; score: number; }
