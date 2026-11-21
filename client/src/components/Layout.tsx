import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Brain, Database, FileText, Leaf, LineChart, LogOut, MapPinned, Recycle, Settings, Shield, Sparkles, Upload, Wand2 } from "lucide-react";

const links = [
  ["/dashboard", "Dashboard", BarChart3], ["/analytics", "Analytics", LineChart], ["/waste-data", "Waste Data", Recycle],
  ["/datasets", "Datasets", Database], ["/forecast", "Forecast", Brain], ["/environment", "Environment", Leaf],
  ["/recommendations", "Recommendations", Sparkles], ["/simulator", "Simulator", Wand2], ["/collection", "Collection", MapPinned],
  ["/reports", "Reports", FileText], ["/admin", "Admin", Shield], ["/settings", "Settings", Settings]
] as const;

export default function Layout() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("wastewise_user") || "{\"name\":\"Demo User\",\"role\":\"VIEWER\"}");
  return <div className="min-h-screen lg:flex">
    <aside className="bg-white border-r border-emerald-100 lg:w-72 lg:min-h-screen p-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-6"><div className="h-10 w-10 rounded-lg bg-leaf text-white grid place-items-center"><Leaf size={22}/></div><div><b>WasteWise AI</b><p className="text-xs text-slate-500">Sustainability Intelligence</p></div></div>
      <nav className="grid grid-cols-2 lg:grid-cols-1 gap-1">{links.map(([to, label, Icon]) => <NavLink className="sidebar-link" to={to} key={to}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    </aside>
    <main className="flex-1">
      <header className="h-auto md:h-16 bg-white border-b border-emerald-100 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm text-slate-500">Organization</p><b>{user.organization || "WasteWise Demo Campus"}</b></div>
        <div className="flex items-center gap-3"><span className="badge">{user.role}</span><button className="btn btn-ghost" onClick={() => { localStorage.clear(); nav("/"); }}><LogOut size={16}/>Logout</button></div>
      </header>
      <div className="p-4 md:p-8"><Outlet /></div>
    </main>
  </div>;
}
