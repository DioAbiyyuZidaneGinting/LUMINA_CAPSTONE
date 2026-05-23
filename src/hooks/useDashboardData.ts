import { useState, useEffect, useCallback } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { DashboardMetrics, InventoryRisk, AIRecommendation } from '../types/dashboard';

export function useDashboardData() {
  const sim = useSimulationStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Start the simulation loop
  useEffect(() => {
    sim.initialize();
    
    const timeoutId = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Return simulation data instead of production data
  return {
    isInitializing: isInitializing,
    metrics: sim.metrics,
    risks: [], // Handled by metrics/simulation logic
    healthScore: 98,
    forecast: sim.forecast,
    aiRecommendations: sim.aiRecommendations,
    isAiLoading: false,
    aiLastRefreshed: sim.lastSync,
    fetchAiData: () => {}, // Mocked
    events: sim.events,
    systemStatus: sim.systemStatus,
    aiHealth: sim.aiHealth,
    lastSync: sim.lastSync
  };
}
