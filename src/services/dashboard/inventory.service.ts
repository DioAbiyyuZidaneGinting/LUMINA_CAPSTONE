import { ProductsRepository } from "../../repositories/products.repository";
import { InventoryRisk } from "../../types/dashboard";

export const InventoryService = {
  normalizeProducts(rawProducts: any[]) {
    if (!Array.isArray(rawProducts)) return [];
    return rawProducts.filter(p => p && p.id && typeof p.stock === 'number');
  },

  async getInventoryRisks(): Promise<InventoryRisk[]> {
    const raw = await ProductsRepository.getAllProducts();
    const products = this.normalizeProducts(raw);

    return products.map(p => {
      const velocity = Math.max(0.1, Math.random() * 5); // Simulated velocity based on missing historical data
      const daysLeft = p.stock > 0 ? Math.floor(p.stock / velocity) : 0;
      
      let status: "CRITICAL" | "WARNING" | "SAFE" = "SAFE";
      if (daysLeft <= 3) status = "CRITICAL";
      else if (daysLeft <= 7) status = "WARNING";

      return {
        productId: p.id.toString(),
        productName: p.name || "Unknown Product",
        category: p.category || "Uncategorized",
        stock: p.stock,
        velocity: Number(velocity.toFixed(1)),
        daysLeft,
        status
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  },
  
  getHealthScore(risks: InventoryRisk[]): number {
    if (risks.length === 0) return 100;
    const criticalCount = risks.filter(r => r.status === "CRITICAL").length;
    const warningCount = risks.filter(r => r.status === "WARNING").length;
    const score = 100 - (criticalCount * 15) - (warningCount * 5);
    return Math.max(0, Math.min(100, score));
  }
};
