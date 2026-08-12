"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { salesApi, groupSaleLines, type Sale, PAYMENT_METHODS } from "@/lib/api/sales"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Package, Boxes, Building2, User, Calendar, CreditCard, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { generateSaleReceipt } from "@/lib/pdf/sale-receipt"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"

interface Props {
    saleId: number | null
    onClose: () => void
}

const STATUS_LABEL: Record<Sale["status"], string> = {
    open: "Abierta",
    posted: "Publicada",
    cancelled: "Cancelada",
}

const STATUS_VARIANT: Record<Sale["status"], "default" | "secondary" | "destructive"> = {
    open: "secondary",
    posted: "default",
    cancelled: "destructive",
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

export function SaleDetailDialog({ saleId, onClose }: Props) {
    const user = useAuthStore((s) => s.user)
    console.log("Usuario en SaleDetailDialog:", user)  // Debug: Verificar que el usuario se carga correctamente
    const [sale, setSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!saleId) { setSale(null); return }
        setLoading(true)
        salesApi.get(saleId)
            .then(setSale)
            .catch(() => sileo.error({ title: "Error al cargar detalle" }))
            .finally(() => setLoading(false))
    }, [saleId])

    const groups = sale
        ? groupSaleLines(sale)
        : { packages: [], loose: [] }

    return (
        <Dialog open={!!saleId} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-3">
                            <span className="font-mono">{sale?.doc_no ?? "..."}</span>
                            {sale && (
                                <Badge variant={STATUS_VARIANT[sale.status]}>
                                    {STATUS_LABEL[sale.status]}
                                </Badge>
                            )}
                        </DialogTitle>
                        {sale && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 mr-6"
                                onClick={async () => {
                                    try {
                                        await generateSaleReceipt(sale, {
                                            businessName: user?.business_name ?? sale.branch_name,
                                            logoUrl: user?.logo_url,  
                                            phone: user?.phone ?? "",
                                            email: user?.email ?? "",
                                            accentColor: [0, 102, 204], // Color corporativo opcional
                                        })
                                    } catch (error) {
                                        console.error("Error al generar el PDF:", error)
                                    }
                                }}
                            >
                                <Download size={14} />
                                PDF
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {loading && (
                    <div className="py-8 text-center text-muted-foreground text-sm">Cargando...</div>
                )}

                {!loading && sale && (
                    <div className="space-y-5">
                        {/* Meta info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 size={14} />
                                <span>{sale.branch_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User size={14} />
                                <span>{sale.user_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar size={14} />
                                <span>{formatDate(sale.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard size={14} />
                                <span>
                                    {PAYMENT_METHODS.find((m) => m.value === sale.payment_method)?.label ?? sale.payment_method}
                                </span>
                            </div>
                        </div>

                        {/* Cliente */}
                        {(sale.customer_name || sale.customer_phone) && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                                    {(sale.customer_name ?? "?").slice(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{sale.customer_name ?? "Sin nombre"}</p>
                                    {sale.customer_phone && (
                                        <p className="text-xs text-muted-foreground">{sale.customer_phone}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Paquetes: se cobran completos, con su contenido a la vista */}
                        {groups.packages.length > 0 && (
                            <div className="space-y-3">
                                {groups.packages.map(({ pkg, items }) => (
                                    <div key={pkg.id} className="border rounded-lg overflow-hidden">
                                        <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/40">
                                            <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <Boxes size={13} className="text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{pkg.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    {pkg.package_code ?? "—"} · {pkg.qty} × {formatCurrency(pkg.unit_price)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold shrink-0">{formatCurrency(pkg.total)}</p>
                                        </div>
                                        <div className="divide-y">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-2 px-3 py-1.5">
                                                    <span className="flex-1 min-w-0 text-sm truncate">{item.product_name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono shrink-0">{item.sku}</span>
                                                    <span className="text-sm tabular-nums w-16 text-right shrink-0">{item.qty} pza</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Productos sueltos */}
                        <div className="space-y-1">
                            {groups.loose.length > 0 && (
                            <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                <span>Producto</span>
                                <span className="text-center">Cant.</span>
                                <span className="text-right">Precio unit.</span>
                                <span className="text-right">Subtotal</span>
                            </div>
                            )}
                            {groups.loose.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_60px_90px_90px] gap-2 items-center px-2 py-2 rounded-md hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <Package size={12} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-center">{item.qty}</p>
                                    <p className="text-sm text-right text-muted-foreground">
                                        {formatCurrency(item.unit_price)}
                                    </p>
                                    <p className="text-sm text-right font-medium">
                                        {formatCurrency(item.qty * item.unit_price)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                {groups.packages.length > 0 && (
                                    <>{groups.packages.length} paquete{groups.packages.length !== 1 ? "s" : ""}
                                        {groups.loose.length > 0 ? " · " : ""}</>
                                )}
                                {(groups.loose.length > 0 || groups.packages.length === 0) &&
                                    `${groups.loose.length} producto${groups.loose.length !== 1 ? "s" : ""}`}
                            </span>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-xl font-bold">{formatCurrency(sale.total)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}