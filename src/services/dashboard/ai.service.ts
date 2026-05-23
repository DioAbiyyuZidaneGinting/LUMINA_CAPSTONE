import { AIRecommendation } from "../../types/dashboard";

let recommendationCache: { timestamp: number; data: AIRecommendation[] } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export const AiService = {
  validateRecommendation(data: any): data is AIRecommendation {
    return (
      typeof data.action === 'string' &&
      typeof data.confidence === 'number' &&
      ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(data.severity) &&
      Array.isArray(data.reasoning) &&
      typeof data.estimatedImpact === 'string' &&
      Array.isArray(data.affectedProducts)
    );
  },

  getFallbackRecommendations(): AIRecommendation[] {
    return [
      {
        id: "fallback-1",
        action: "Periksa Stok Kritis",
        confidence: 100,
        severity: "HIGH",
        reasoning: ["Koneksi API AI terputus", "Sistem menggunakan rule-based fallback"],
        estimatedImpact: "Mencegah potensi stockout",
        affectedProducts: ["Produk dengan stok <= 5"]
      }
    ];
  },

  async getRecommendations(metrics: any, risks: any): Promise<AIRecommendation[]> {
    if (recommendationCache && (Date.now() - recommendationCache.timestamp < CACHE_TTL_MS)) {
      return recommendationCache.data;
    }

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics, risks }),
      });

      if (!response.ok) throw new Error("AI API Error");

      const data = await response.json();
      
      if (data.recommendations && Array.isArray(data.recommendations)) {
        const valid = data.recommendations.filter((r: any) => this.validateRecommendation(r));
        if (valid.length > 0) {
           // Tagging with generated ID if missing
           valid.forEach((r: any, i: number) => { if (!r.id) r.id = `ai-${Date.now()}-${i}`; });
           recommendationCache = { timestamp: Date.now(), data: valid };
           return valid;
        }
      }
      
      console.warn("AiService: AI Response failed schema validation, using fallback.");
      return this.getFallbackRecommendations();
    } catch (err) {
      console.error("AiService: Error fetching AI insights", err);
      return this.getFallbackRecommendations();
    }
  }
};
