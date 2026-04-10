"use client"
import Link from "next/link"
import { TrendingUp, ShoppingCart, BarChart3, Warehouse, Users, ChevronRight } from "lucide-react"
import { QUICK_ACTIONS, GREEN, BLUE, ACCENT } from "../constants/dashboard.constants"

const ICONS = {
    "/dashboard/sales/new": TrendingUp,
    "/dashboard/purchases/new": ShoppingCart,
    "/dashboard/reports": BarChart3,
    "/dashboard/branch-products": Warehouse,
    "/dashboard/customers": Users,
} as const

export function QuickActions() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            {QUICK_ACTIONS.map(({ label, href, color }) => {
                const Icon = ICONS[href as keyof typeof ICONS] ?? ChevronRight
                return (
                    <Link key={href} href={href} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                        textDecoration: "none", color: "var(--foreground)", fontSize: 13, fontWeight: 500,
                        transition: "all .15s",
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${color}60`
                            e.currentTarget.style.color = color
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)"
                            e.currentTarget.style.color = "var(--foreground)"
                        }}
                    >
                        <div style={{ background: `${color}18`, borderRadius: 8, padding: 8, color, flexShrink: 0 }}>
                            <Icon size={14} />
                        </div>
                        {label}
                        <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.4 }} />
                    </Link>
                )
            })}
        </div>
    )
}