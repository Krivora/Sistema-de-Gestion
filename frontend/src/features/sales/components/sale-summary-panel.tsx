import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, AlertCircle, AlertTriangle, Save } from "lucide-react"
import { PAYMENT_METHODS } from "@/lib/api/sales"
import type { CartItem, CartPackage, StockWarning } from "../hooks/use-new-sale"

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

interface Props {
    cart: CartItem[]
    cartPackages: CartPackage[]
    subtotal: number
    /** Piezas totales: las sueltas más las que aportan los paquetes */
    totalUnits: number
    packagesSubtotal: number
    paymentMethod: string
    stockWarnings: StockWarning[]
    canSubmit: boolean | string
    loading: boolean
    branchId: string
    isEdit?: boolean
    paymentType?: "contado" | "credito"
    onSubmitOpen: () => void
    onSubmitPost: () => void
}

export function SaleSummaryPanel({ cart, cartPackages, subtotal, totalUnits, packagesSubtotal, paymentMethod, stockWarnings, canSubmit, loading, branchId, isEdit = false, paymentType = "contado", onSubmitOpen, onSubmitPost }: Props) {
    const isCredit = paymentType === "credito"
    return (
        <div className="border rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Resumen</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                    <span>Productos sueltos</span><span>{cart.length}</span>
                </div>
                {cartPackages.length > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                        <span>Paquetes</span>
                        <span>
                            {cartPackages.reduce((a, g) => a + (Number(g.qty) || 0), 0)} · {formatCurrency(packagesSubtotal)}
                        </span>
                    </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                    <span>Total unidades</span><span>{totalUnits}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Método de pago</span>
                    <span>{PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                    <span>Total</span><span>{formatCurrency(subtotal)}</span>
                </div>
            </div>

            {stockWarnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                        {stockWarnings
                            .map((w) => `${w.product_name} (pide ${w.needed}, hay ${w.available})`)
                            .join(", ")} supera el stock disponible
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                {/* Una venta a abonos no puede publicarse al crearla: se publica
                    desde el diálogo de abonos, cuando el saldo llega a cero. */}
                {!isCredit && (
                    <Button
                        className="w-full"
                        onClick={onSubmitPost}
                        disabled={!canSubmit || loading}
                    >
                        <ShoppingBag size={16} className="mr-2" />
                        {loading
                            ? (isEdit ? "Publicando..." : "Registrando...")
                            : (isEdit ? "Guardar y publicar" : "Registrar y publicar")}
                    </Button>
                )}
                <Button
                    className="w-full"
                    variant={isCredit ? "default" : "outline"}
                    onClick={onSubmitOpen}
                    disabled={!canSubmit || loading}
                >
                    <Save size={16} className="mr-2" />
                    {loading
                        ? "Guardando..."
                        : isCredit
                            ? "Registrar venta a abonos"
                            : isEdit ? "Guardar cambios" : "Guardar abierta"}
                </Button>
            </div>

            {isCredit && (
                <p className="text-xs text-muted-foreground text-center">
                    Después registra los abonos desde la lista de ventas
                </p>
            )}

            {!branchId && (
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <AlertCircle size={12} />
                    Selecciona una sucursal para agregar productos
                </p>
            )}
        </div>
    )
}