// fix: mobile sidebar overlay + safe padding
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Sidebar } from "@/components/shared/layout/sidebar"
import { Topbar } from "@/components/shared/layout/topbar"
import { useUIStore } from "@/store/ui.store"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token)
    const router = useRouter()
    const [hydrated, setHydrated] = useState(false)
    const collapsed = useUIStore((s) => s.sidebarCollapsed)

    useEffect(() => { setHydrated(true) }, [])
    useEffect(() => {
        if (hydrated && !token) router.push("/login")
    }, [hydrated, token, router])

    if (!hydrated || !token) return null

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className={cn(
                "transition-all duration-300 ease-in-out",
                "md:pl-60",
                collapsed && "md:pl-14"
            )}>
                <div className="flex flex-col min-h-screen">
                    <Topbar />
                    <main className="flex-1 overflow-y-auto p-5">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}