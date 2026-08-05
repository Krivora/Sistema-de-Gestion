"use client"
import { useCallback, useEffect, useState } from "react"
import { sileo } from "sileo"
import { ChevronDown, ChevronRight, HandCoins, Phone, Users, AlertTriangle, CheckCircle2 } from "lucide-react"
import { salesApi, type ReceivablesReport } from "@/lib/api/sales"
import { getApiError } from "@/lib/input-helpers"
import { formatCurrency, formatDate } from "@/lib/utils"
import { SalePaymentsDialog } from "@/features/sales/components/sale-payments-dialog"
import { Button } from "@/components/ui/button"

const EMPTY: ReceivablesReport = {
    totals: { balance: 0, customers: 0, sales: 0, overdue_30: 0 },
    customers: [],
}

/** Ámbar a partir de 15 días sin abonar, rojo a partir de 30. */
function ageColor(days: number) {
    if (days >= 30) return "text-destructive"
    if (days >= 15) return "text-amber-600 dark:text-amber-400"
    return "text-muted-foreground"
}

function StatCard({ label, value, sub, icon: Icon, tone }: {
    label: string
    value: string
    sub?: string
    icon: React.ElementType
    tone?: "danger"
}) {
    return (
        <div className="rounded-xl border p-4 flex items-start gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <Icon size={17} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold truncate">{value}</p>
                {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
            </div>
        </div>
    )
}

export default function ReceivablesPage() {
    const [data, setData] = useState<ReceivablesReport>(EMPTY)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState<Set<string>>(new Set())
    const [paymentsId, setPaymentsId] = useState<number | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            setData(await salesApi.receivables())
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cargar las cuentas por cobrar") })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    function toggle(key: string) {
        setOpen((prev) => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold">Cuentas por cobrar</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Ventas a abonos con saldo pendiente
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                    label="Total por cobrar" icon={HandCoins}
                    value={loading ? "—" : formatCurrency(data.totals.balance)}
                    sub={`${data.totals.sales} venta${data.totals.sales !== 1 ? "s" : ""}`}
                />
                <StatCard
                    label="Clientes con adeudo" icon={Users}
                    value={loading ? "—" : String(data.totals.customers)}
                />
                <StatCard
                    label="Con más de 30 días" icon={AlertTriangle} tone="danger"
                    value={loading ? "—" : formatCurrency(data.totals.overdue_30)}
                    sub="sin abonar desde hace un mes"
                />
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : data.customers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                    <CheckCircle2 size={32} className="opacity-40" />
                    <p className="text-sm">Nadie te debe nada</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {data.customers.map((c) => {
                        const key = String(c.customer_id ?? c.customer_name)
                        const isOpen = open.has(key)
                        return (
                            <li key={key} className="rounded-xl border overflow-hidden">
                                <button
                                    onClick={() => toggle(key)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
                                >
                                    {isOpen
                                        ? <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                                        : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}

                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{c.customer_name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                            {c.customer_phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone size={11} />{c.customer_phone}
                                                </span>
                                            )}
                                            <span>{c.sales_count} venta{c.sales_count !== 1 ? "s" : ""}</span>
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="font-semibold">{formatCurrency(c.balance)}</p>
                                        <p className={`text-[11px] ${ageColor(c.oldest_days)}`}>
                                            {c.oldest_days} día{c.oldest_days !== 1 ? "s" : ""} sin abonar
                                        </p>
                                    </div>
                                </button>

                                {isOpen && (
                                    <ul className="border-t divide-y bg-muted/20">
                                        {c.sales.map((s) => (
                                            <li key={s.id} className="flex items-center gap-3 px-4 py-2.5 pl-11">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-mono">{s.doc_no}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {formatDate(s.created_at)} · {s.branch_name}
                                                        {s.last_payment_at
                                                            ? ` · último abono ${formatDate(s.last_payment_at)}`
                                                            : " · sin abonos"}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-medium">{formatCurrency(s.balance)}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        de {formatCurrency(s.total)}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm" variant="outline" className="h-7 text-xs shrink-0"
                                                    onClick={() => setPaymentsId(s.id)}
                                                >
                                                    Abonar
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            <SalePaymentsDialog
                saleId={paymentsId}
                onClose={() => setPaymentsId(null)}
                onChange={load}
            />
        </div>
    )
}
