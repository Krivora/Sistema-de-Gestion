"use client"

import { useState } from "react"
import { Activity as ActivityIcon, ChevronDown, ChevronRight } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { Activity } from "@/lib/api/activities"

// ── helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  info:     "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent",
  warning:  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent",
  error:    "bg-red-500/10 text-red-600 dark:text-red-400 border-transparent",
  critical: "bg-red-500/20 text-red-700 dark:text-red-300 border-transparent font-semibold",
}

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent",
  failure: "bg-red-500/10 text-red-600 dark:text-red-400 border-transparent",
}

const ACTION_STYLES: Record<string, string> = {
  CREATE:     "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  UPDATE:     "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE:     "bg-red-500/10 text-red-700 dark:text-red-400",
  ACTIVATE:   "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  DEACTIVATE: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  LOGIN:      "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  REGISTER:   "bg-purple-500/10 text-purple-700 dark:text-purple-400",
}

function actionStyle(action: string) {
  const prefix = Object.keys(ACTION_STYLES).find((k) => action.startsWith(k))
  return prefix ? ACTION_STYLES[prefix] : "bg-muted text-muted-foreground"
}

// ── detail row ────────────────────────────────────────────────────────────────

function DataBlock({ label, data }: { label: string; data: Record<string, unknown> }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <pre className="text-xs bg-muted/60 rounded-md p-3 overflow-auto max-h-48 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

function ActivityDetail({ activity }: { activity: Activity }) {
  const hasData = activity.old_data || activity.new_data || activity.metadata

  return (
    <div className="px-4 py-3 bg-muted/30 border-t space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        {activity.user_agent && (
          <span><span className="font-medium text-foreground">User-agent: </span>{activity.user_agent}</span>
        )}
        {activity.duration_ms != null && (
          <span><span className="font-medium text-foreground">Duración: </span>{activity.duration_ms} ms</span>
        )}
        {activity.category && (
          <span><span className="font-medium text-foreground">Categoría: </span>{activity.category}</span>
        )}
      </div>

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activity.old_data && <DataBlock label="Antes" data={activity.old_data} />}
          {activity.new_data && <DataBlock label="Después" data={activity.new_data} />}
          {activity.metadata && !activity.old_data && !activity.new_data && (
            <DataBlock label="Metadata" data={activity.metadata} />
          )}
        </div>
      )}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function ActivitiesTable({ items, loading, hasActiveFilters }: {
  items: Activity[]
  loading: boolean
  hasActiveFilters: boolean
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const hasDetail = (a: Activity) =>
    !!(a.old_data || a.new_data || a.metadata || a.user_agent || a.duration_ms != null)

  const columns: ColumnDef<Activity>[] = [
    {
      key: "expand", header: "", width: 32,
      cell: (a) => hasDetail(a)
        ? (
          <button
            onClick={() => toggle(a.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded.has(a.id)
              ? <ChevronDown size={14} />
              : <ChevronRight size={14} />}
          </button>
        )
        : null,
    },
    {
      key: "action", header: "Acción", width: 150,
      cell: (a) => (
        <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${actionStyle(a.action)}`}>
          {a.action}
        </code>
      ),
    },
    {
      key: "description", header: "Descripción", width: "35%",
      cell: (a) => <span className="truncate block max-w-sm text-sm">{a.description}</span>,
    },
    {
      key: "severity", header: "Nivel", width: 90,
      cell: (a) => (
        <Badge variant="outline" className={`text-xs ${SEVERITY_STYLES[a.severity] ?? ""}`}>
          {a.severity}
        </Badge>
      ),
    },
    {
      key: "status", header: "Estado", width: 90,
      cell: (a) => (
        <Badge variant="outline" className={`text-xs ${STATUS_STYLES[a.status] ?? ""}`}>
          {a.status}
        </Badge>
      ),
    },
    {
      key: "ref", header: "Referencia", width: 130,
      cell: (a) => a.ref_table
        ? <span className="text-xs text-muted-foreground font-mono">{a.ref_table}{a.ref_id ? ` #${a.ref_id}` : ""}</span>
        : null,
    },
    {
      key: "user", header: "Usuario", width: "15%",
      cell: (a) => <span className="text-sm text-muted-foreground whitespace-nowrap">{a.user_name ?? "—"}</span>,
    },
    {
      key: "ip", header: "IP", width: 120,
      cell: (a) => <span className="text-xs text-muted-foreground font-mono">{a.ip_address ?? "—"}</span>,
    },
    {
      key: "date", header: "Fecha", width: 155,
      cell: (a) => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(a.created_at)}</span>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      rowKey={(a) => a.id}
      emptyIcon={<ActivityIcon size={32} className="text-muted-foreground/40" />}
      emptyText="No hay actividad registrada"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}