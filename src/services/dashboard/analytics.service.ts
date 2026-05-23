import { OrdersRepository } from "../../repositories/orders.repository";
import { DashboardMetrics } from "../../types/dashboard";

export const AnalyticsService = {
  normalizeOrders(rawOrders: any[]) {
    if (!Array.isArray(rawOrders)) return [];
    return rawOrders
      .filter(order => order && typeof order.total_amount === 'number' && order.created_at)
      .map(order => ({
        id: order.id,
        total_amount: order.total_amount,
        created_at: order.created_at,
        user_id: order.user_id,
        status: order.status || 'completed'
      }));
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const rawOrders = await OrdersRepository.getRecentOrders(1000);
    const orders = this.normalizeOrders(rawOrders);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const netIncome = totalRevenue * 0.65; // Simulated 65% margin

    return {
      totalRevenue,
      netIncome,
      totalOrders,
      avgOrderValue,
      revenueGrowth: 12.5,
      netIncomeGrowth: 15.2,
      ordersGrowth: 8.2,
      aovGrowth: 3.1
    };
  }
};
