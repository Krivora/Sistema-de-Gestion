import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, AlertCircle } from "lucide-react"
import type { CartItem } from "../hooks/use-new-purchase"

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

interface Props {
    cart: CartItem[]
    subtotal: number
    canSubmit: boolean | string
    loading: boolean
    branchId: string
    onSubmit: () => void
}

export function PurchaseSummaryPanel({ cart, subtotal, canSubmit, loading, branchId, onSubmit }: Props) {
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
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                    <span>Total</span><span>{formatCurrency(subtotal)}</span>
                </div>
            </div>
            <Button className="w-full" onClick={onSubmit} disabled={!canSubmit || loading}>
                <ShoppingCart size={16} className="mr-2" />
                {loading ? "Registrando..." : "Registrar compra"}
            </Button>
            {!branchId && (
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <AlertCircle size={12} />
                    Selecciona una sucursal para agregar productos
                </p>
            )}
        </div>
    )
}