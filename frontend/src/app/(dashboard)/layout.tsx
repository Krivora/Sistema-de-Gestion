"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Sidebar } from "@/components/shared/layout/sidebar"
import { Topbar } from "@/components/shared/layout/topbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token)
    const router = useRouter()
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (hydrated && !token) router.push("/login")
    }, [hydrated, token, router])

    // Espera hidratación antes de decidir
    if (!hydrated) return null

    // Token ausente — redirigiendo
    if (!token) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar fijo */}
            <Sidebar />

            {/* Contenedor principal */}
            <div className="md:pl-60">
                <div className="flex flex-col h-screen">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}