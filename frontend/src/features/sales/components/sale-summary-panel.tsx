import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, AlertCircle, AlertTriangle, Save } from "lucide-react"
import { PAYMENT_METHODS } from "@/lib/api/sales"
import type { CartItem } from "../hooks/use-new-sale"

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

interface Props {
    cart: CartItem[]
    subtotal: number
    paymentMethod: string
    stockWarnings: CartItem[]
    canSubmit: boolean | string
    loading: boolean
    branchId: string
    onSubmitOpen: () => void
    onSubmitPost: () => void
}

export function SaleSummaryPanel({ cart, subtotal, paymentMethod, stockWarnings, canSubmit, loading, branchId, onSubmitOpen, onSubmitPost }: Props) {
    return (
        <div className="border rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Resumen</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                    <span>Productos</span><span>{cart.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Total unidades</span><span>{cart.reduce((a, c) => a + (Number(c.qty) || 0), 0)}</span>
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
                    <span>{stockWarnings.map((w) => w.product_name).join(", ")} supera el stock disponible</span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Button
                    className="w-full"
                    onClick={onSubmitPost}
                    disabled={!canSubmit || loading}
                >
                    <ShoppingBag size={16} className="mr-2" />
                    {loading ? "Registrando..." : "Registrar y publicar"}
                </Button>
                <Button
                    className="w-full"
                    variant="outline"
                    onClick={onSubmitOpen}
                    disabled={!canSubmit || loading}
                >
                    <Save size={16} className="mr-2" />
                    {loading ? "Guardando..." : "Guardar abierta"}
                </Button>
            </div>

            {!branchId && (
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <AlertCircle size={12} />
                    Selecciona una sucursal para agregar productos
                </p>
            )}
        </div>
    )
}