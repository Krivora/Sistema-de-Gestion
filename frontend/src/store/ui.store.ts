import { create } from "zustand"

// store/ui.store.ts
interface UIState {
    mobileOpen: boolean
    setMobileOpen: (v: boolean) => void
    sidebarCollapsed: boolean
    setSidebarCollapsed: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    mobileOpen: false,
    setMobileOpen: (v) => set({ mobileOpen: v }),
    sidebarCollapsed: false,
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}))