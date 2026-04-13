import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Trash2, Package, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BranchProduct } from "@/lib/api/branch-products"
import type { CartItem } from "../hooks/use-new-sale"

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

interface Props {
    searchRef: React.RefObject<HTMLDivElement>
    branchId: string
    loadingProducts: boolean
    productSearch: string
    searchOpen: boolean
    filteredProducts: BranchProduct[]
    cart: CartItem[]
    subtotal: number
    onSearchChange: (v: string) => void
    onSearchOpen: (v: boolean) => void
    onAddToCart: (bp: BranchProduct) => void
    onUpdateCart: (id: number, field: "qty" | "unit_price", v: string) => void
    onRemoveFromCart: (id: number) => void
}

export function SaleCartPanel({
    searchRef, branchId, loadingProducts, productSearch, searchOpen,
    filteredProducts, cart, subtotal,
    onSearchChange, onSearchOpen, onAddToCart, onUpdateCart, onRemoveFromCart,
}: Props) {
    return (
        <div className="border rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Productos</h2>
            <div ref={searchRef} className="relative">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={!branchId ? "Selecciona una sucursal primero..." : loadingProducts ? "Cargando productos..." : "Buscar producto por nombre o SKU..."}
                        value={productSearch}
                        onChange={(e) => { onSearchChange(e.target.value); onSearchOpen(true) }}
                        onFocus={() => onSearchOpen(true)}
                        disabled={!branchId || loadingProducts}
                        className="pl-9"
                    />
                </div>
                {searchOpen && branchId && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-lg overflow-hidden">
                        <div className="max-h-[260px] overflow-y-auto">
                            {filteredProducts.slice(0, 10).map((bp) => (
                                <button key={bp.id} onClick={() => onAddToCart(bp)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left">
                                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                        <Package size={13} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{bp.product_name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{bp.sku}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground">Precio</p>
                                        <p className="text-sm font-semibold">{formatCurrency(bp.price)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground">Stock</p>
                                        <p className={cn("text-sm font-semibold", bp.current_stock <= bp.min_stock && "text-amber-600 dark:text-amber-400")}>
                                            {bp.current_stock}
                                        </p>
                                    </div>
                                    <Plus size={16} className="text-muted-foreground shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {searchOpen && branchId && productSearch && filteredProducts.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-sm px-4 py-3 text-sm text-muted-foreground">
                        Sin resultados para "{productSearch}"
                    </div>
                )}
            </div>

            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ShoppingBag size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">Agrega productos usando el buscador</p>
                </div>
            ) : (
                <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_100px_120px_36px] gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <span>Producto</span><span className="text-center">Cantidad</span><span className="text-center">Precio unit.</span><span />
                    </div>
                    {cart.map((item) => {
                        const overStock = Number(item.qty) > item.current_stock
                        return (
                            <div key={item.product_id} className={cn("grid grid-cols-[1fr_100px_120px_36px] gap-3 items-center px-3 py-2 rounded-lg transition-colors", overStock ? "bg-amber-50/50 dark:bg-amber-950/20" : "hover:bg-muted/40")}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                        <Package size={12} className="text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                                            <Badge variant={overStock ? "destructive" : "secondary"} className="text-[10px] px-1 py-0 h-4">
                                                Stock: {item.current_stock}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Input value={item.qty} onChange={(e) => onUpdateCart(item.product_id, "qty", e.target.value)} inputMode="numeric" className={cn("h-8 text-center text-sm", (!item.qty || Number(item.qty) <= 0 || overStock) && "border-destructive")} />
                                <Input value={item.unit_price} onChange={(e) => onUpdateCart(item.product_id, "unit_price", e.target.value)} inputMode="decimal" className={cn("h-8 text-right text-sm", item.unit_price === "" && "border-destructive")} />
                                <button onClick={() => onRemoveFromCart(item.product_id)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )
                    })}
                    <Separator className="my-2" />
                    <div className="flex justify-end px-3 py-1">
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total estimado</p>
                            <p className="text-lg font-bold">{formatCurrency(subtotal)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}