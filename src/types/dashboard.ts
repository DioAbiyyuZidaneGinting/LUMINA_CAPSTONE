export interface DashboardMetrics {
  totalRevenue: number;
  netIncome: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
  netIncomeGrowth: number;
  ordersGrowth: number;
  aovGrowth: number;
}

export interface RevenueAnalytics {
  date: string;
  sales: number;
  predicted: number;
  factor?: string;
  icon?: "users" | "zap" | "star" | "calendar";
}

export interface InventoryRisk {
  productId: string;
  productName: string;
  category: string;
  stock: number;
  velocity: number; // average sales per day
  daysLeft: number;
  status: "CRITICAL" | "WARNING" | "SAFE";
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenueShare: number; // percentage
  trend: string;
  color: string;
}

export interface AIRecommendation {
  id: string;
  title?: string;
  action?: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasoning: string[];
  estimatedImpact: string | number;
  affectedProducts: string[];
}

export interface HeatmapData {
  day: string;
  hours: { hour: string; intensity: number }[];
}

export interface LiveActivityEvent {
  id: string;
  icon: string;
  type: "order" | "payment" | "stock" | "ai" | "user";
  text: string;
  time: string;
  timestamp: string;
}

export interface RealtimeEvent {
  id: string;
  type: "ORDER" | "INVENTORY" | "AI_PREDICTION" | "SYSTEM";
  message: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    location?: string;
    confidence?: number;
    sku?: string;
  };
}
