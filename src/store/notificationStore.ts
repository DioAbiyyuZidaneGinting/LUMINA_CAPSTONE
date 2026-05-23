"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReactNode } from "react";

export type NotificationType = "SUCCESS" | "INFO" | "WARNING" | "CRITICAL";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: NotificationType;
  source: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: "initial-1",
          title: "System Initialized",
          description: "Lumina OS Intelligence Engine is online.",
          timestamp: new Date().toISOString(),
          type: "INFO",
          source: "System",
          isRead: false
        }
      ],
      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
            isRead: false
          },
          ...state.notifications
        ].slice(0, 50) // Keep last 50 notifications
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: "lumina-notifications",
    }
  )
);
