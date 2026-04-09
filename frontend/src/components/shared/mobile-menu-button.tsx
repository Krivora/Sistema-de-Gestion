"use client"
import { Menu } from "lucide-react"
import { useUIStore } from "@/store/ui.store"

export function MobileMenuButton() {
    const toggleMobile = useUIStore((s) => s.toggleMobile)

    return (
        <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Abrir menú"
        >
            <Menu size={20} />
        </button>
    )
}