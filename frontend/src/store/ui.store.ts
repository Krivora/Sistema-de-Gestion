import { create } from "zustand"

interface UIState {
    mobileOpen: boolean
    setMobileOpen: (v: boolean) => void
    toggleMobile: () => void
    sidebarCollapsed: boolean
    setSidebarCollapsed: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    mobileOpen: false,
    setMobileOpen: (v) => set({ mobileOpen: v }),
    toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
    sidebarCollapsed: false,
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}))