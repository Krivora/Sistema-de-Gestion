import { create } from "zustand"

interface UIState {
    sidebarOpen: boolean
    mobileOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (v: boolean) => void
    toggleMobile: () => void
    setMobileOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    mobileOpen: false,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (v) => set({ sidebarOpen: v }),
    toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
    setMobileOpen: (v) => set({ mobileOpen: v }),
}))