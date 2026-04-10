"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { reportsApi, type DashboardReport, type SalesReport, type PurchasesReport, type TopProduct } from "@/lib/api/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, ShoppingCart, Package, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: React.ElementType; trend?: "up" | "down" }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-semibold mt-1">{value}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${trend === "up" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : trend === "down" ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" : "bg-primary/10 text-primary"}`}>
                        <Icon size={18} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SimpleBarChart({ data, dataKey, labelKey, color = "bg-primary" }: { data: Record<string, unknown>[]; dataKey: string; labelKey: string; color?: string }) {
    if (!data.length) return <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
    const max = Math.max(...data.map((d) => Number(d[dataKey]) || 0))
    return (
        <div className="space-y-2">
            {data.map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-xs text-muted-foreground truncate shrink-0">{String(d[labelKey])}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${max > 0 ? (Number(d[dataKey]) / max) * 100 : 0}%` }} />
                    </div>
                    <span className="w-24 text-right font-medium shrink-0">{typeof d[dataKey] === "number" && dataKey.includes("total") ? formatCurrency(Number(d[dataKey])) : String(d[dataKey])}</span>
                </div>
            ))}
        </div>
    )
}

const today = new Date().toISOString().split("T")[0]
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

export default function ReportsPage() {
    const [startDate, setStartDate] = useState(thirtyDaysAgo)
    const [endDate, setEndDate] = useState(today)
    const [dashboard, setDashboard] = useState<DashboardReport | null>(null)
    const [sales, setSales] = useState<SalesReport[]>([])
    const [purchases, setPurchases] = useState<PurchasesReport[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [loading, setLoading] = useState(false)

    async function load() {
        setLoading(true)
        try {
            const [dash, s, p, top] = await Promise.all([
                reportsApi.dashboard(startDate, endDate),
                reportsApi.sales(startDate, endDate),
                reportsApi.purchases(startDate, endDate),
                reportsApi.topProducts(10),
            ])
            setDashboard(dash)
            setSales(s)
            setPurchases(p)
            setTopProducts(top)
        } catch {
            sileo.error({ title: "Error al cargar reportes" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Reportes</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Resumen de actividad del período</p>
                </div>
                <div className="flex items-end gap-3 ml-auto">
                    <div className="space-y-1">
                        <Label className="text-xs">Desde</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-[150px]" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Hasta</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-[150px]" />
                    </div>
                    <Button size="sm" onClick={load} disabled={loading}>{loading ? "Cargando..." : "Aplicar"}</Button>
                </div>
            </div>

            {/* KPIs */}
            {dashboard && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Ventas" value={String(dashboard.total_sales)} icon={ShoppingCart} trend="up" />
                    <StatCard title="Compras" value={String(dashboard.total_purchases)} icon={Package} />
                    <StatCard title="Ingresos" value={formatCurrency(dashboard.total_revenue)} icon={TrendingUp} trend="up" />
                    <StatCard title="Gastos" value={formatCurrency(dashboard.total_expense)} icon={TrendingDown} trend="down" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ventas por día */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 size={16} /> Ventas por día
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={sales} dataKey="total_sales" labelKey="date" color="bg-primary" />
                    </CardContent>
                </Card>

                {/* Compras por día */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 size={16} /> Compras por día
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={purchases} dataKey="total_spent" labelKey="date" color="bg-orange-500" />
                    </CardContent>
                </Card>

                {/* Top productos */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp size={16} /> Productos más vendidos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={topProducts} dataKey="total_sales" labelKey="product_name" color="bg-emerald-500" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}