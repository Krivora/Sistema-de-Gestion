"use client"
import { useEffect, useMemo, useState } from "react"
import { Minus, Plus, Search, Package as PackageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn, formatCurrency, formatQty, toNumber } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { BranchProduct } from "@/lib/api/branch-products"
import type { Package } from "@/lib/api/packages"
import type { CartPackageItem } from "../hooks/use-new-sale"

interface Props {
    /** null = cerrado */
    pkg: Package | null
    branchProducts: BranchProduct[]
    /** Contenido actual, al editar un paquete ya agregado */
    initialItems: CartPackageItem[]
    onConfirm: (items: { product_id: number; qty: number }[]) => void
    onCancel: () => void
}

export function PackageBuilderDialog({ pkg, branchProducts, initialItems, onConfirm, onCancel }: Props) {
    const [picked, setPicked] = useState<Map<number, number>>(new Map())
    const [search, setSearch] = useState("")
    const isMobile = useMediaQuery("(max-width: 639px)")

    useEffect(() => {
        if (!pkg) return
        setSearch("")
        setPicked(new Map(initialItems.map((i) => [i.product_id, i.qty])))
        // initialItems cambia de identidad en cada render del padre: la clave real
        // es qué paquete se está armando.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pkg])

    /** Lo que el paquete acepta, según cómo se configuró en el catálogo. */
    const allowed = useMemo(() => {
        if (!pkg) return []
        if (pkg.selection_scope === "category")
            return branchProducts.filter((bp) => bp.category_id === pkg.category_id)
        if (pkg.selection_scope === "list") {
            const ids = new Set(pkg.items.map((i) => i.product_id))
            return branchProducts.filter((bp) => ids.has(bp.product_id))
        }
        return branchProducts
    }, [pkg, branchProducts])

    const results = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return allowed.slice(0, 30)
        return allowed
            .filter((bp) => bp.product_name.toLowerCase().includes(q) || bp.sku.toLowerCase().includes(q))
            .slice(0, 30)
    }, [allowed, search])

    if (!pkg) return null

    const target = Number(pkg.item_count ?? 0)
    const total = [...picked.values()].reduce((a, q) => a + q, 0)
    const complete = total === target

    function change(productId: number, delta: number) {
        setPicked((prev) => {
            const next = new Map(prev)
            const value = (next.get(productId) ?? 0) + delta
            if (value <= 0) next.delete(productId)
            else next.set(productId, value)
            return next
        })
    }

    const pickedList = [...picked.entries()].map(([product_id, qty]) => ({
        product_id, qty,
        product: branchProducts.find((bp) => bp.product_id === product_id),
    }))

    const scopeHint =
        pkg.selection_scope === "category" ? `Solo productos de ${pkg.category_name ?? "la categoría"}`
            : pkg.selection_scope === "list" ? "Solo los productos que acepta el paquete"
                : "Cualquier producto de la sucursal"

    const body = (
        <>
            <div className="px-6 pt-5 pb-4 border-b">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-base font-medium truncate">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground">{scopeHint}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold leading-tight">{formatCurrency(pkg.price)}</p>
                        <p className={cn(
                            "text-xs font-medium",
                            complete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        )}>
                            {total} de {target} pieza(s)
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
                {/* Seleccionados */}
                {pickedList.length > 0 && (
                    <div className="space-y-1 border rounded-lg p-2">
                        {pickedList.map(({ product_id, qty, product }) => (
                            <div key={product_id} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{product?.product_name ?? `#${product_id}`}</p>
                                    <p className="text-[11px] text-muted-foreground font-mono">{product?.sku}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => change(product_id, -1)}
                                        aria-label={`Quitar una pieza de ${product?.product_name ?? ""}`}
                                        className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-muted transition-colors"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="w-7 text-center text-sm font-medium">{qty}</span>
                                    <button
                                        type="button"
                                        onClick={() => change(product_id, 1)}
                                        disabled={total >= target}
                                        aria-label={`Agregar una pieza de ${product?.product_name ?? ""}`}
                                        className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buscador */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar producto por nombre o SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                        autoFocus
                    />
                </div>

                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {results.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            {allowed.length === 0
                                ? "No hay productos disponibles para este paquete en esta sucursal"
                                : `Sin resultados para "${search}"`}
                        </p>
                    ) : (
                        results.map((bp) => {
                            const chosen = picked.get(bp.product_id) ?? 0
                            const full = total >= target
                            return (
                                <button
                                    key={bp.id}
                                    type="button"
                                    onClick={() => change(bp.product_id, 1)}
                                    disabled={full}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PackageIcon size={13} className="text-primary shrink-0" />
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium truncate">{bp.product_name}</span>
                                        <span className="block text-xs text-muted-foreground font-mono">{bp.sku}</span>
                                    </span>
                                    <span className="text-right shrink-0">
                                        <span className="block text-[11px] text-muted-foreground">Stock</span>
                                        <span className={cn(
                                            "block text-sm font-semibold",
                                            toNumber(bp.current_stock) <= toNumber(bp.min_stock) && "text-amber-600 dark:text-amber-400"
                                        )}>
                                            {formatQty(bp.current_stock)}
                                        </span>
                                    </span>
                                    {chosen > 0 && (
                                        <Badge variant="secondary" className="shrink-0">{chosen}</Badge>
                                    )}
                                    <Plus size={15} className="text-muted-foreground shrink-0" />
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                <p className={cn("text-xs", complete ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                    {complete
                        ? "✓ Paquete completo"
                        : total > target
                            ? `Quita ${total - target} pieza(s)`
                            : `Faltan ${target - total} pieza(s)`}
                </p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
                    <Button
                        size="sm"
                        disabled={!complete}
                        onClick={() => onConfirm([...picked.entries()].map(([product_id, qty]) => ({ product_id, qty })))}
                    >
                        Agregar paquete
                    </Button>
                </div>
            </div>
        </>
    )

    if (isMobile) {
        return (
            <Sheet open onOpenChange={(v) => !v && onCancel()}>
                <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl max-h-[92dvh] flex flex-col">
                    <SheetTitle className="sr-only">Armar {pkg.name}</SheetTitle>
                    <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
                    {body}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="max-w-150 p-0 gap-0 overflow-hidden rounded-2xl max-h-[90dvh] flex flex-col">
                <DialogTitle className="sr-only">Armar {pkg.name}</DialogTitle>
                {body}
            </DialogContent>
        </Dialog>
    )
}
