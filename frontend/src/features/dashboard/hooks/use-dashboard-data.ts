"use client"
import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import type {
    DashboardData,
} from "../types"

import {
    LOW_STOCK_THRESHOLD,
    TOP_PRODUCTS_LIMIT
} from "../constants/dashboard.constants"



export function useDashboardData(
  startDate: string,
  endDate: string
) {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    sales7: [],
    sales30: [],
    purchases30: [],
    topProducts: [],
    lowStock: [],
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [
        sumRes,
        s7Res,
        s30Res,
        p30Res,
        topRes,
        stockRes,
      ] = await Promise.allSettled([
        apiClient.get(`/reports/dashboard`, {
          params: { startDate, endDate },
        }),
        apiClient.get(`/reports/sales`, {
          params: { startDate, endDate },
        }),
        apiClient.get(`/reports/sales`, {
          params: { startDate, endDate },
        }),
        apiClient.get(`/reports/purchases`, {
          params: { startDate, endDate },
        }),
        apiClient.get(`/reports/top-products`, {
          params: { limit: TOP_PRODUCTS_LIMIT },
        }),
        apiClient.get(`/reports/stock`),
      ])

      setData({
        summary:
          sumRes.status === "fulfilled"
            ? sumRes.value.data
            : null,
        sales7:
          s7Res.status === "fulfilled"
            ? s7Res.value.data
            : [],
        sales30:
          s30Res.status === "fulfilled"
            ? s30Res.value.data
            : [],
        purchases30:
          p30Res.status === "fulfilled"
            ? p30Res.value.data
            : [],
        topProducts:
          topRes.status === "fulfilled"
            ? topRes.value.data
            : [],
        lowStock:
          stockRes.status === "fulfilled"
            ? stockRes.value.data
                .filter((s) => s.stock <= LOW_STOCK_THRESHOLD)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 8)
            : [],
      })

      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  return { data, loading, lastUpdate, load }
}