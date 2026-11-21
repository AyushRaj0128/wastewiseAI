import axios from "axios";
import { demo } from "./analytics";
import { Role, WasteRecord } from "../types";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api" });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("wastewise_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getOrDemo<T>(path: string, fallback: T): Promise<T> {
  try { return (await api.get(path)).data; } catch { return fallback; }
}

export async function login(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("wastewise_token", data.token);
    localStorage.setItem("wastewise_user", JSON.stringify(data.user));
    return data.user;
  } catch {
    const role = email.includes("admin") ? "ADMIN" : email.includes("analyst") ? "ANALYST" : "VIEWER";
    const user = { id: "demo", name: role === "ADMIN" ? "Asha Admin" : role === "ANALYST" ? "Nikhil Analyst" : "Vera Viewer", email, role, organization: "WasteWise Demo Campus" };
    localStorage.setItem("wastewise_token", "demo-token");
    localStorage.setItem("wastewise_user", JSON.stringify(user));
    return user;
  }
}

export async function registerUser(input: { name: string; email: string; password: string; organization: string; role: Role }) {
  try {
    const { data } = await api.post("/auth/register", input);
    localStorage.setItem("wastewise_token", data.token);
    localStorage.setItem("wastewise_user", JSON.stringify(data.user));
    return data.user;
  } catch {
    const user = { id: crypto.randomUUID(), name: input.name, email: input.email, role: input.role, organization: input.organization };
    localStorage.setItem("wastewise_token", "demo-token");
    localStorage.setItem("wastewise_user", JSON.stringify(user));
    return user;
  }
}

export async function createWasteRecord(input: Omit<WasteRecord, "id" | "recyclable">) {
  const { data } = await api.post("/waste", input);
  return data as WasteRecord;
}

export async function uploadDataset(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/datasets/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
  return data as { preview: Record<string, string>[]; invalidRows: { row: number; errors: string[] }[]; duplicates: number; message: string };
}

export const demoApi = demo;
