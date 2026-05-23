import { create } from "zustand";

interface SidebarState {
  isOpenMobile: boolean;
  toggleMobile: () => void;
  setOpenMobile: (open: boolean) => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpenMobile: false,
  toggleMobile: () => set((state) => ({ isOpenMobile: !state.isOpenMobile })),
  setOpenMobile: (open) => set({ isOpenMobile: open }),
  closeMobile: () => set({ isOpenMobile: false }),
}));
