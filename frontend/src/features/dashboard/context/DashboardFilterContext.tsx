// /features/dashboard/context/DashboardFilterContext.tsx
"use client"
import { createContext, useContext, useState } from "react"
import {
    DATE_RANGES,
    DateRangeKey,
    getDateRange,
} from "../constants/dashboard.constants"

interface DashboardFilterContextValue {
    range: DateRangeKey
    setRange: (range: DateRangeKey) => void
    startDate: string
    endDate: string
}

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null)

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
    const [range, setRange] = useState<DateRangeKey>(DATE_RANGES.LAST_30_DAYS)
    const { startDate, endDate } = getDateRange(range)

    return (
        <DashboardFilterContext.Provider value={{ range, setRange, startDate, endDate }}>
            {children}
        </DashboardFilterContext.Provider>
    )
}

export function useDashboardFilter() {
    const ctx = useContext(DashboardFilterContext)
    if (!ctx) throw new Error("useDashboardFilter must be used within DashboardFilterProvider")
    return ctx
}