"use client"
import { useEffect } from "react"
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data"
import {
    DashboardHero, KpiCards, SalesAreaChart, FinancialSummary,
    TopProductsChart, SalesVsPurchases, LowStockAlert, QuickActions,
} from "@/features/dashboard"

export default function DashboardPage() {
    const { data, loading, lastUpdate, load } = useDashboardData()

    useEffect(() => { load() }, [load])

    return (
        <>
            <style>{`
        .db-root { display:flex; flex-direction:column; gap:28px; padding-bottom:40px; }
        .db-hero { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .db-greeting { font-size:13px; color:var(--muted-foreground); letter-spacing:.04em; text-transform:uppercase; font-weight:500; }
        .db-title { font-size:26px; font-weight:700; color:var(--foreground); margin:2px 0 0; line-height:1.2; }
        .db-refresh { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted-foreground); background:transparent; border:1px solid var(--border); border-radius:8px; padding:6px 12px; cursor:pointer; transition:all .15s; }
        .db-refresh:hover { border-color:#d97757; color:#d97757; }
        .db-refresh svg { transition:transform .3s; }
        .db-refresh:hover svg { transform:rotate(180deg); }
        .db-update-info { display:flex; align-items:center; gap:8px; }
        .db-update-dot { width:6px; height:6px; border-radius:50%; background:#788c5d; box-shadow:0 0 6px #788c5d80; }
        .db-update-text { font-size:11px; color:var(--muted-foreground); }
        .stats-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        @media(min-width:900px){ .stats-grid { grid-template-columns:repeat(4,1fr); } }
        .stat-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; display:flex; align-items:flex-start; gap:14px; transition:all .2s; position:relative; overflow:hidden; }
        .stat-card:hover { border-color:#d9775740; transform:translateY(-1px); box-shadow:0 4px 20px #d9775712; }
        .stat-icon-wrap { border-radius:10px; padding:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .stat-body { display:flex; flex-direction:column; gap:2px; min-width:0; }
        .stat-label { font-size:12px; color:var(--muted-foreground); font-weight:500; letter-spacing:.02em; white-space:nowrap; }
        .stat-value { font-size:22px; font-weight:700; color:var(--foreground); line-height:1.2; white-space:nowrap; }
        .stat-sub { display:flex; align-items:center; gap:3px; font-size:11px; color:var(--muted-foreground); margin-top:2px; }
        .sub-up { color:#788c5d !important; }
        .sub-down { color:#e05c5c !important; }
        .charts-primary { display:grid; grid-template-columns:1fr; gap:14px; }
        @media(min-width:1024px){ .charts-primary { grid-template-columns:2fr 1fr; } }
        .charts-secondary { display:grid; grid-template-columns:1fr; gap:14px; }
        @media(min-width:900px){ .charts-secondary { grid-template-columns:1fr 1fr; } }
        .chart-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:16px; }
        .profit-card { background:linear-gradient(135deg,#d9775715 0%,#6a9bcc10 100%); border:1px solid #d9775730; border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:12px; }
        .profit-big { font-size:36px; font-weight:800; color:var(--foreground); line-height:1; }
        .profit-big span { font-size:18px; color:var(--muted-foreground); }
        .profit-divider { height:1px; background:var(--border); }
        .section-header { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
        .section-title { font-size:14px; font-weight:600; color:var(--foreground); }
        .section-sub { font-size:11px; color:var(--muted-foreground); }
        .period-badge { display:inline-flex; align-items:center; gap:5px; background:var(--border); border-radius:99px; padding:3px 10px; font-size:11px; color:var(--muted-foreground); }
        .db-tooltip { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:10px 14px; font-size:12px; color:var(--foreground); box-shadow:0 4px 20px #00000020; }
        .db-tooltip-label { font-weight:600; margin-bottom:4px; color:var(--muted-foreground); }
        .db-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:32px; color:var(--muted-foreground); }
        .db-empty svg { opacity:.3; }
        .db-empty p { font-size:13px; }
        @keyframes shimmer { to { background-position:200% center; } }
        .skeleton-line { border-radius:6px; background:linear-gradient(90deg,var(--border) 25%,var(--muted,#88888820) 50%,var(--border) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
      `}</style>

            <div className="db-root">
                <DashboardHero loading={loading} lastUpdate={lastUpdate} onRefresh={load} />
                <QuickActions />
                <KpiCards summary={data.summary} lowStock={data.lowStock} loading={loading} />
                <div className="charts-primary">
                    <SalesAreaChart sales7={data.sales7} loading={loading} />
                    <FinancialSummary summary={data.summary} loading={loading} />
                </div>
                <div className="charts-secondary">
                    <TopProductsChart topProducts={data.topProducts} loading={loading} />
                    <SalesVsPurchases sales30={data.sales30} purchases30={data.purchases30} loading={loading} />
                </div>
                <LowStockAlert lowStock={data.lowStock} loading={loading} />

            </div>
        </>
    )
}