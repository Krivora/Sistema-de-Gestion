"use client"
import { RefreshCw } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"

interface Props {
    loading: boolean
    lastUpdate: Date
    onRefresh: () => void
}

export function SuperadminHero({ loading, lastUpdate, onRefresh }: Props) {
    const user = useAuthStore((s) => s.user)
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"
    const firstName = user?.name?.split(" ")[0] ?? ""

    return (
        <div className="db-hero">
            <div>
                <p className="db-greeting">
                    {greeting}{firstName ? `, ${firstName}` : ""}
                </p>
                <h1 className="db-title">Panorama del sistema</h1>
            </div>

            <div className="db-update-info">
                <div className="db-update-dot" aria-hidden />
                <span className="db-update-text">
                    {lastUpdate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                    className="db-refresh"
                    onClick={onRefresh}
                    disabled={loading}
                    aria-label="Actualizar panorama"
                >
                    <RefreshCw size={13} aria-hidden className={loading ? "animate-spin" : ""} />
                    <span>Actualizar</span>
                </button>
            </div>
        </div>
    )
}
