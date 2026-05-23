"use client";

import { useState } from "react";
import {
  MapPin, Truck, Ship, Plane, Bike, Box, Thermometer,
  Battery, AlertTriangle, Clock, Activity, ShieldAlert,
  Search, SlidersHorizontal, ChevronRight, Package,
  MoreVertical, CheckCircle2, Factory, Navigation, Database,
  ArrowRight, Anchor, Flame, Snowflake, Crosshair, Filter
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────

const FLEET_ASSETS = [
  {
    id: "TRK-0192",
    orderId: "#ORD-8821",
    trackingId: "JNE082191821",
    type: "Refrigerated Truck",
    mode: "truck",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=800",
    courier: "Maersk Inland",
    origin: "Tanjung Priok Port",
    dest: "Cikarang Dry Port",
    state: "In Transit",
    progress: 45,
    eta: "1h 15m",
    fuel: 78,
    temp: "-18.5°C",
    delay: "None",
    riskScore: 12,
  },
  {
    id: "VES-MSC-9",
    orderId: "#ORD-8822",
    trackingId: "MSC-992-XYZ",
    type: "Cargo Vessel",
    mode: "ship",
    image: "https://images.unsplash.com/photo-1559002244-77a8eb6a7c3e?auto=format&fit=crop&q=80&w=800",
    courier: "MSC Global",
    origin: "Shanghai Port",
    dest: "Tanjung Perak",
    state: "Customs Clearance",
    progress: 92,
    eta: "Pending",
    fuel: 42,
    temp: "Ambient",
    delay: "+4h 20m",
    riskScore: 88,
  },
  {
    id: "FLT-GA-CX",
    orderId: "#ORD-8823",
    trackingId: "GA-AWB-001",
    type: "Boeing 777F",
    mode: "plane",
    image: "https://images.unsplash.com/photo-1544839803-05c0d5402919?auto=format&fit=crop&q=80&w=800",
    courier: "Garuda Cargo",
    origin: "Incheon (ICN)",
    dest: "Soekarno-Hatta",
    state: "Arriving",
    progress: 88,
    eta: "45m",
    fuel: 22,
    temp: "22.0°C",
    delay: "None",
    riskScore: 5,
  },
  {
    id: "VAN-JX-44",
    orderId: "#ORD-8824",
    trackingId: "SICEPAT-001",
    type: "Delivery Van",
    mode: "van",
    image: "https://images.unsplash.com/photo-1563821013-1490b4d455d3?auto=format&fit=crop&q=80&w=800",
    courier: "J&T Express",
    origin: "Bandung Hub",
    dest: "Dago Branch",
    state: "Loading",
    progress: 5,
    eta: "14h 30m",
    fuel: 100,
    temp: "N/A",
    delay: "None",
    riskScore: 8,
  },
];

const SHIPMENT_MANIFESTS = [
  {
    id: "#SHP-9921",
    name: "Electronics (High Value)",
    mode: "plane",
    iconBg: "bg-indigo-50 text-indigo-600",
    originCode: "CGK",
    originCity: "Jakarta",
    destCode: "KNO",
    destCity: "Medan",
    status: "In Air",
    progress: 68,
    eta: "2h 15m",
    tags: ["Fragile", "Priority"],
    barColor: "bg-indigo-600",
  },
  {
    id: "#SHP-9922",
    name: "Apparel Batch",
    mode: "truck",
    iconBg: "bg-blue-50 text-blue-600",
    originCode: "BDO",
    originCity: "Bandung",
    destCode: "SUB",
    destCity: "Surabaya",
    status: "In Transit",
    progress: 35,
    eta: "14h 30m",
    tags: ["Standard"],
    barColor: "bg-blue-500",
  },
  {
    id: "#SHP-9923",
    name: "Industrial Equipment",
    mode: "ship",
    iconBg: "bg-purple-50 text-purple-600",
    originCode: "TPP",
    originCity: "Tanjung Priok",
    destCode: "MAK",
    destCity: "Makassar Port",
    status: "Docking",
    progress: 82,
    eta: "4h 00m",
    tags: ["Heavy", "Oversized"],
    barColor: "bg-purple-600",
  },
  {
    id: "#SHP-9924",
    name: "Fresh Groceries",
    mode: "bike",
    iconBg: "bg-emerald-50 text-emerald-600",
    originCode: "WH3",
    originCity: "Warehouse 3",
    destCode: "KBY",
    destCity: "Kebayoran Baru",
    status: "Out for Delivery",
    progress: 15,
    eta: "45m",
    tags: ["Cold-Chain", "Perishable"],
    barColor: "bg-emerald-500",
  }
];

function getModeIcon(mode: string) {
  switch (mode) {
    case "plane": return Plane;
    case "ship": return Anchor;
    case "bike": return Bike;
    case "van": return Package;
    default: return Truck;
  }
}

export default function LogisticsMonitoring() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState(FLEET_ASSETS[0].id);

  const filteredAssets = FLEET_ASSETS.filter(asset => 
    asset.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.courier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAsset = FLEET_ASSETS.find(a => a.id === selectedAssetId) || FLEET_ASSETS[0];

  return (
    <div className="font-sans max-w-[1600px] mx-auto flex flex-col gap-8 pb-12">
      
      {/* ─── HEADER ACTIONS ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Fleet Operations</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time asset tracking and cargo telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search Order ID, Resi, Asset..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* ─── 1. LIVE ROUTE INTELLIGENCE ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Navigation className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Route Intelligence</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tracking Order: <span className="font-semibold text-slate-700">{activeAsset.orderId}</span></p>
            </div>
          </div>
          
          <div className="flex gap-6 pr-4">
             <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Fuel Level</p>
               <p className="text-sm font-bold text-slate-800">{activeAsset.fuel}%</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Cargo Temp</p>
               <p className={`text-sm font-bold ${activeAsset.temp.includes('-') ? 'text-blue-600' : 'text-slate-800'}`}>{activeAsset.temp}</p>
             </div>
          </div>
        </div>

        <div className="h-64 bg-slate-100 relative overflow-hidden w-full">
          {/* Premium map grid background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
          
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
             <path d="M 100 125 Q 50%" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
             {/* Using a simpler line for full width responsiveness */}
             <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
             <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
          </svg>

          <style>{`
            @keyframes dash {
              to { stroke-dashoffset: -1000; }
            }
          `}</style>

          <div className="absolute top-1/2 left-[10%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-5 h-5 bg-white border-4 border-slate-300 rounded-full shadow-sm" />
             <div className="mt-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
               <p className="text-[10px] font-bold text-slate-500 uppercase">Origin</p>
               <p className="text-xs font-bold text-slate-900">{activeAsset.origin}</p>
             </div>
          </div>

          <div className="absolute top-1/2 left-[90%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-6 h-6 bg-white border-4 border-indigo-500 rounded-full shadow-md" />
             <div className="mt-2 bg-indigo-50/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
               <p className="text-[10px] font-bold text-indigo-500 uppercase">Destination</p>
               <p className="text-xs font-bold text-indigo-900">{activeAsset.dest}</p>
             </div>
          </div>

          {/* Live Vehicle */}
          <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
             <div className="w-10 h-10 bg-indigo-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white relative">
               <Crosshair className="w-5 h-5" />
               <div className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-ping" />
             </div>
             <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold">{activeAsset.state}</span>
             </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex justify-between relative max-w-4xl mx-auto">
            <div className="absolute top-3 left-6 right-6 h-1 bg-slate-100 rounded-full -z-0" />
            <div className="absolute top-3 left-6 w-[45%] h-1 bg-indigo-500 rounded-full -z-0" />

            {[
              { label: "Dispatched", time: "08:00", active: true },
              { label: "Transit Hub", time: "11:30", active: true },
              { label: "Customs", time: "14:00", active: true, current: true },
              { label: "Final Mile", time: "Pending", active: false },
              { label: "Delivered", time: "Pending", active: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center z-10 w-24">
                <div className={`w-7 h-7 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                  step.current ? "bg-indigo-600" : step.active ? "bg-slate-800" : "bg-slate-200"
                }`}>
                  {step.active && !step.current && <CheckCircle2 className="w-3 h-3 text-white" />}
                  {step.current && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <p className={`text-[11px] font-bold mt-2 ${step.current ? "text-indigo-600" : step.active ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] font-medium text-slate-500">{step.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2. SHIPMENT MANIFESTS (Clean Card Grid) ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Box className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Shipment Manifests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active high-priority cargo</p>
            </div>
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SHIPMENT_MANIFESTS.map((item, idx) => {
            const Icon = getModeIcon(item.mode);
            return (
              <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors bg-white">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.id}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.name}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-semibold whitespace-nowrap">
                    {item.status}
                  </span>
                </div>

                {/* Route Line */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Origin</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {item.originCode} <span className="text-slate-500 font-medium">({item.originCity})</span>
                    </p>
                  </div>
                  
                  {/* Dotted connector */}
                  <div className="flex-1 px-4 relative flex items-center justify-center">
                    <div className="w-full h-px border-t border-dashed border-slate-300"></div>
                    <div className="w-2 h-2 rounded-full border-2 border-slate-300 bg-white absolute"></div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Destination</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {item.destCode} <span className="text-slate-500 font-medium">({item.destCity})</span>
                    </p>
                  </div>
                </div>

                {/* Tags & Progress Text */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1.5">
                    {item.tags.map(tag => (
                      <span key={tag} className="border border-slate-200 text-slate-500 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${item.barColor.replace('bg-', 'text-')}`}>
                    {item.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
                  <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${item.progress}%` }}></div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">ETA: {item.eta}</p>
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Manifest <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. TRACKING LIST (Moved to Bottom) ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <Activity className="w-5 h-5 text-slate-600" />
             </div>
             <div>
               <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Fleet Monitoring</h3>
               <p className="text-xs text-slate-500 mt-0.5">Vehicle health & capacity</p>
             </div>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">{filteredAssets.length} Vehicles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No shipments found.</p>
              <p className="text-xs text-slate-500">Try a different Order ID or Resi.</p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
            const isSelected = selectedAssetId === asset.id;
            const ModeIcon = getModeIcon(asset.mode);
            
            return (
              <div 
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? "border-indigo-500 ring-2 ring-indigo-50 shadow-md" 
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-slate-100">
                    <img src={asset.image} alt={asset.type} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/10" />
                    <div className="absolute top-1 left-1 w-5 h-5 rounded bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <ModeIcon className="w-3 h-3 text-slate-700" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{asset.orderId}</h4>
                        <p className="text-[11px] font-medium text-slate-500 truncate">{asset.trackingId}</p>
                      </div>
                    </div>

                    <div className="mt-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Route</p>
                       <p className="text-xs font-semibold text-slate-800 truncate">{asset.origin} ➔ {asset.dest}</p>
                    </div>
                  </div>
                </div>

                {/* Tiny Progress Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${asset.progress}%` }} />
                   </div>
                   <span className="text-[10px] font-bold text-indigo-600 shrink-0">ETA: {asset.eta}</span>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

    </div>
  );
}
