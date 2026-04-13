// app/dashboard/page.tsx
"use client"
import { useEffect } from "react"
import { DashboardFilterProvider, useDashboardFilter } from "@/features/dashboard/context/DashboardFilterContext"
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data"
import { DateRangeSelector } from "@/features/dashboard/widgets/DateRangeSelector"
import {
    DashboardHero, KpiCards, SalesAreaChart,
    FinancialSummary, TopProductsChart, SalesVsPurchases,
    LowStockAlert, QuickActions,
} from "@/features/dashboard"
import styles from "./dashboard.module.css"

function DashboardContent() {
    const { startDate, endDate } = useDashboardFilter()
    const { data, loading, lastUpdate, load } = useDashboardData(startDate, endDate)

    useEffect(() => { load() }, [load])

    return (
        <div className={styles.root}>
            <div className={styles.hero}>
                <DashboardHero loading={loading} lastUpdate={lastUpdate} onRefresh={load} />
                <DateRangeSelector />
            </div>
            <QuickActions />
            <KpiCards summary={data.summary} lowStock={data.lowStock} loading={loading} />
            <div className={styles.chartsPrimary}>
                <SalesAreaChart sales7={data.sales7} loading={loading} />
                <FinancialSummary summary={data.summary} loading={loading} />
            </div>
            <div className={styles.chartsSecondary}>
                <TopProductsChart topProducts={data.topProducts} loading={loading} />
                <SalesVsPurchases sales30={data.sales30} purchases30={data.purchases30} loading={loading} />
            </div>
            <LowStockAlert lowStock={data.lowStock} loading={loading} />
        </div>
    )
}

export default function DashboardPage() {
    return (
        <DashboardFilterProvider>
            <DashboardContent />
        </DashboardFilterProvider>
    )
}