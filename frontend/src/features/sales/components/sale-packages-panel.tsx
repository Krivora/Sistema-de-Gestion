"use client"
import { Search, Plus, Trash2, Boxes, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn, formatCurrency, formatQty } from "@/lib/utils"
import { packageUnitCount, type Package } from "@/lib/api/packages"
import type { BranchProduct } from "@/lib/api/branch-products"
import type { CartPackage } from "../hooks/use-new-sale"
import { PackageBuilderDialog } from "./package-builder-dialog"

interface Props {
    searchRef: React.RefObject<HTMLDivElement>
    branchId: string
    search: string
    searchOpen: boolean
    /** Paquetes del catálogo, marcados según se puedan surtir en esta sucursal */
    filteredPackages: { pkg: Package; available: boolean }[]
    cartPackages: CartPackage[]
    packagesSubtotal: number
    branchProducts: BranchProduct[]
    builder: { pkg: Package; uid: string | null } | null
    onSearchChange: (v: string) => void
    onSearchOpen: (v: boolean) => void
    onAddPackage: (pkg: Package) => void
    onRemovePackage: (uid: string) => void
    onUpdatePackageQty: (uid: string, qty: string) => void
    onEditPackage: (uid: string) => void
    onBuilderConfirm: (items: { product_id: number; qty: number }[]) => void
    onBuilderCancel: () => void
}

export function SalePackagesPanel({
    searchRef, branchId, search, searchOpen, filteredPackages, cartPackages,
    packagesSubtotal, branchProducts, builder,
    onSearchChange, onSearchOpen, onAddPackage, onRemovePackage,
    onUpdatePackageQty, onEditPackage, onBuilderConfirm, onBuilderCancel,
}: Props) {
    const builderInitialItems = builder?.uid
        ? cartPackages.find((g) => g.uid === builder.uid)?.items ?? []
        : []

    return (
        <div className="border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Paquetes
                </h2>
                {cartPackages.length > 0 && (
                    <span className="text-sm font-semibold">{formatCurrency(packagesSubtotal)}</span>
                )}
            </div>

            <div ref={searchRef} className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={!branchId ? "Selecciona una sucursal primero..." : "Buscar paquete por nombre o código..."}
                    value={search}
                    onChange={(e) => { onSearchChange(e.target.value); onSearchOpen(true) }}
                    onFocus={() => onSearchOpen(true)}
                    disabled={!branchId}
                    className="pl-9"
                />
                {searchOpen && branchId && filteredPackages.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-lg overflow-hidden">
                        <div className="max-h-65 overflow-y-auto">
                            {filteredPackages.slice(0, 10).map(({ pkg, available }) => (
                                <button
                                    key={pkg.id}
                                    type="button"
                                    onClick={() => available && onAddPackage(pkg)}
                                    disabled={!available}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                        <Boxes size={13} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{pkg.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {available
                                                ? `${pkg.code} · ${packageUnitCount(pkg)} pieza(s)${pkg.kind === "flexible" ? " a elegir" : ""}`
                                                : "No disponible en esta sucursal"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground">Precio</p>
                                        <p className="text-sm font-semibold">{formatCurrency(pkg.price)}</p>
                                    </div>
                                    <Plus size={16} className="text-muted-foreground shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {searchOpen && branchId && search && filteredPackages.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-sm px-4 py-3 text-sm text-muted-foreground">
                        Sin paquetes para &quot;{search}&quot;
                    </div>
                )}
            </div>

            {cartPackages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                    Agrega un paquete para vender por mayoreo
                </p>
            ) : (
                <div className="space-y-3">
                    {cartPackages.map((group) => {
                        const packs = Number(group.qty) || 0
                        const unitsPerPack = group.items.reduce((a, i) => a + i.qty, 0)
                        return (
                            <div key={group.uid} className="border rounded-lg overflow-hidden">
                                <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/40">
                                    <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                        <Boxes size={13} className="text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{group.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground font-mono">{group.code}</span>
                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                                {unitsPerPack} pza/paq
                                            </Badge>
                                        </div>
                                    </div>

                                    <Input
                                        value={group.qty}
                                        onChange={(e) => onUpdatePackageQty(group.uid, e.target.value)}
                                        inputMode="numeric"
                                        aria-label={`Paquetes de ${group.name}`}
                                        className={cn("h-8 w-16 text-center text-sm", packs <= 0 && "border-destructive")}
                                    />
                                    <span className="text-sm font-semibold w-24 text-right shrink-0">
                                        {formatCurrency(packs * group.unit_price)}
                                    </span>

                                    {group.kind === "flexible" && (
                                        <button
                                            type="button"
                                            onClick={() => onEditPackage(group.uid)}
                                            aria-label={`Cambiar contenido de ${group.name}`}
                                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onRemovePackage(group.uid)}
                                        aria-label={`Quitar ${group.name}`}
                                        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Contenido: sale todo del inventario al registrar la venta */}
                                <div className="divide-y">
                                    {group.items.map((item) => (
                                        <div key={item.product_id} className="flex items-center gap-3 px-3 py-1.5 pl-13">
                                            <span className="flex-1 min-w-0 text-sm truncate">{item.product_name}</span>
                                            <span className="text-xs text-muted-foreground font-mono shrink-0">{item.sku}</span>
                                            <span className="text-sm tabular-nums w-20 text-right shrink-0">
                                                {formatQty(item.qty * packs)} pza
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    <Separator />
                    <div className="flex justify-end px-1">
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total en paquetes</p>
                            <p className="text-base font-bold">{formatCurrency(packagesSubtotal)}</p>
                        </div>
                    </div>
                </div>
            )}

            <PackageBuilderDialog
                pkg={builder?.pkg ?? null}
                branchProducts={branchProducts}
                initialItems={builderInitialItems}
                onConfirm={onBuilderConfirm}
                onCancel={onBuilderCancel}
            />
        </div>
    )
}
