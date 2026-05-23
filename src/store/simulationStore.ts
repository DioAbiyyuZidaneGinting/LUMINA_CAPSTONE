import { create } from "zustand";
import { 
  DashboardMetrics, 
  RealtimeEvent, 
  AIRecommendation, 
  RevenueAnalytics 
} from "../types/dashboard";

interface SimulationState {
  isInitializing: boolean;
  metrics: DashboardMetrics;
  events: RealtimeEvent[];
  aiRecommendations: AIRecommendation[];
  forecast: RevenueAnalytics[];
  lastSync: Date;
  systemStatus: "CONNECTED" | "SYNCING" | "OFFLINE";
  aiHealth: "HEALTHY" | "OPTIMIZING";
  
  // Actions
  tick: () => void;
  initialize: () => void;
  stop: () => void;
  intervalId: NodeJS.Timeout | null;
}

const INITIAL_METRICS: DashboardMetrics = {
  totalRevenue: 1383328500,
  netIncome: 806497210,
  totalOrders: 4850,
  avgOrderValue: 285222,
  revenueGrowth: 12.4,
  netIncomeGrowth: 8.7,
  ordersGrowth: 15.2,
  aovGrowth: -2.1,
};

const INITIAL_EVENTS: RealtimeEvent[] = [
  { id: "e1", type: "ORDER", message: "New order confirmed: Rp 450.000", timestamp: new Date(Date.now() - 60000).toISOString(), metadata: { amount: 450000, location: "Jakarta Selatan" } },
  { id: "e2", type: "AI_PREDICTION", message: "Regional demand spike detected in Jawa Barat", timestamp: new Date(Date.now() - 300000).toISOString(), metadata: { confidence: 92, location: "Bandung" } },
  { id: "e3", type: "INVENTORY", message: "Critical Stock Warning: SKU-992 (Hoodie Oversize)", timestamp: new Date(Date.now() - 600000).toISOString(), metadata: { sku: "SKU-992" } },
];

const INITIAL_RECS: AIRecommendation[] = [
  {
    id: "r1",
    title: "Optimize Inventory: Kemeja Oxford",
    severity: "CRITICAL",
    confidence: 94,
    reasoning: ["Demand for 'Outerwear' is up 15%", "Regional stock at Warehouse-B is below 5%", "Current replenishment cycle is 4 days too slow"],
    estimatedImpact: 14200000,
    affectedProducts: ["SKU-992", "SKU-995"],
  },
  {
    id: "r2",
    title: "Regional Pricing Adjustment",
    severity: "MEDIUM",
    confidence: 88,
    reasoning: ["Competitor pricing detected 5% lower in Surabaya", "Local conversion rate dropped 12%"],
    estimatedImpact: 8500000,
    affectedProducts: ["SKU-441", "SKU-442"],
  }
];

// Generate 365 days of mock forecast with overlap for smooth transition
const generateForecast = (): RevenueAnalytics[] => {
  const data: RevenueAnalytics[] = [];
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (364 - i));
    const baseValue = 40000000 + Math.random() * 20000000;
    
    // Transition point at 335.
    // Overlap: Prediction starts at 330, Sales ends at 335.
    const isPast = i <= 335; 
    const isFuture = i >= 330; 
    
    data.push({
      date: date.toISOString().split("T")[0],
      sales: isPast ? baseValue : null as any,
      predicted: isFuture ? (isPast ? baseValue * (0.98 + Math.random() * 0.04) : baseValue + 5000000) : null as any,
    });
  }
  return data;
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isInitializing: true,
  metrics: INITIAL_METRICS,
  events: INITIAL_EVENTS,
  aiRecommendations: INITIAL_RECS,
  forecast: generateForecast(),
  lastSync: new Date(),
  systemStatus: "CONNECTED",
  aiHealth: "HEALTHY",
  intervalId: null,

  initialize: () => {
    const { intervalId } = get();
    if (intervalId) return;

    set({ isInitializing: false });
    
    const id = setInterval(() => {
      get().tick();
    }, 3000);

    set({ intervalId: id });
  },

  stop: () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
      set({ intervalId: null });
    }
  },

  tick: () => {
    const { metrics, events, forecast, aiRecommendations } = get();

    // 1. Mutate Metrics slightly
    const newMetrics = {
      ...metrics,
      totalRevenue: metrics.totalRevenue + (Math.random() > 0.7 ? Math.floor(Math.random() * 500000) : 0),
      totalOrders: metrics.totalOrders + (Math.random() > 0.8 ? 1 : 0),
      revenueGrowth: Number((metrics.revenueGrowth + (Math.random() - 0.5) * 0.1).toFixed(1)),
    };

    // 2. Add New Events (randomly)
    let newEvents = [...events];
    if (Math.random() > 0.95) {
      const types: RealtimeEvent["type"][] = ["ORDER", "INVENTORY", "AI_PREDICTION", "SYSTEM"];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = `sim-${Date.now()}`;
      
      let message = "System heartbeat stable";
      let metadata = {};

      if (type === "ORDER") {
        const amt = Math.floor(Math.random() * 1000000) + 150000;
        message = `New transaction: Rp ${amt.toLocaleString("id-ID")}`;
        metadata = { amount: amt, location: ["Jakarta", "Bandung", "Surabaya", "Medan"][Math.floor(Math.random() * 4)] };
      } else if (type === "INVENTORY") {
        message = `Stock low for SKU-${Math.floor(Math.random() * 900) + 100}`;
        metadata = { sku: `SKU-${Math.floor(Math.random() * 900) + 100}` };
      } else if (type === "AI_PREDICTION") {
        message = `New demand anomaly detected in ${["Shoes", "Shirts", "Pants"][Math.floor(Math.random() * 3)]}`;
        metadata = { confidence: Math.floor(Math.random() * 10) + 85 };
      }

      newEvents = [{ id, type, message, timestamp: new Date().toISOString(), metadata }, ...events.slice(0, 19)];
    }

    // 3. Shift Forecast (shift the last few predicted points)
    const newForecast = forecast.map((f, i) => {
      if (f.predicted) {
        return { ...f, predicted: f.predicted + (Math.random() - 0.5) * 1000000 };
      }
      return f;
    });

    // 4. Update AI recommendations occasionally
    let newRecs = [...aiRecommendations];
    if (Math.random() > 0.99) {
      // Just swap or update impact
      newRecs = aiRecommendations.map(r => ({
        ...r,
        estimatedImpact: typeof r.estimatedImpact === 'number' ? r.estimatedImpact + (Math.random() - 0.5) * 500000 : r.estimatedImpact
      }));
    }

    set({
      metrics: newMetrics,
      events: newEvents,
      forecast: newForecast,
      aiRecommendations: newRecs,
      lastSync: new Date(),
      systemStatus: Math.random() > 0.98 ? "SYNCING" : "CONNECTED",
      aiHealth: Math.random() > 0.95 ? "OPTIMIZING" : "HEALTHY",
    });
  },
}));
