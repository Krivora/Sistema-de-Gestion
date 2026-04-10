"use client"
import { RefreshCw } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"

interface Props {
    loading: boolean
    lastUpdate: Date
    onRefresh: () => void
}

export function DashboardHero({ loading, lastUpdate, onRefresh }: Props) {
    const user = useAuthStore((s) => s.user)
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"

    return (
        <div className="db-hero">
            <div>
                <p className="db-greeting">{greeting}, {user?.name?.split(" ")[0]}</p>
                <h1 className="db-title">{user?.business_name ?? "Panel de control"}</h1>
            </div>
            <div className="db-update-info">
                <div className="db-update-dot" />
                <span className="db-update-text">
                    Actualizado {lastUpdate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button className="db-refresh" onClick={onRefresh} disabled={loading}>
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    Actualizar
                </button>
            </div>
        </div>
    )
}