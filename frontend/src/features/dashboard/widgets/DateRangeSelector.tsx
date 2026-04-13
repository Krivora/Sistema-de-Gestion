"use client"
import {
    DATE_RANGE_LABELS,
    DateRangeKey,
} from "../constants/dashboard.constants"
import { useDashboardFilter } from "../context/DashboardFilterContext"

export function DateRangeSelector() {
    const { range, setRange } = useDashboardFilter()

    return (
        <div style={{
            display: "flex",
            background: "var(--muted)",
            borderRadius: 10,
            padding: 3,
            gap: 2,
        }}>
            {Object.entries(DATE_RANGE_LABELS).map(([key, label]) => {
                const isActive = range === key
                return (
                    <button
                        key={key}
                        onClick={() => setRange(key as DateRangeKey)}
                        style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: "none",
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 400,
                            cursor: "pointer",
                            transition: "all .15s",
                            background: isActive ? "var(--card)" : "transparent",
                            color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                            boxShadow: isActive ? "0 1px 4px #00000018" : "none",
                        }}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}