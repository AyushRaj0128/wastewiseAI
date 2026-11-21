export type Role = "ADMIN" | "ANALYST" | "VIEWER";
export type DisposalMethod = "Recycling" | "Composting" | "Reuse" | "Landfill" | "Incineration" | "Other";
export type Source = "Residential" | "Commercial" | "Industrial" | "Institutional" | "College" | "Municipal";
export interface User { id: string; name: string; email: string; passwordHash: string; role: Role; organization: string; createdAt: string; updatedAt: string; }
export interface WasteCategory { id: string; name: string; description: string; recyclable: boolean; compostable: boolean; hazardous: boolean; emissionFactor: number; disposalMethod: DisposalMethod; }
export interface WasteRecord { id: string; date: string; location: string; category: string; quantityKg: number; source: Source; disposalMethod: DisposalMethod; recyclable: boolean; notes?: string; createdBy?: string; createdAt: string; updatedAt: string; }
export interface Dataset { id: string; name: string; rows: number; dateRange: string; categories: string[]; locations: string[]; quality: Record<string, number>; createdAt: string; }
