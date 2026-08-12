"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { sileo } from "sileo"
import { Search, Plus, Trash2, Package as PackageIcon, Boxes } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatCurrency } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getApiError, onlyDigits, toInputNumber } from "@/lib/input-helpers"
import { productsApi, type Product } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import {
    packagesApi, PACKAGE_KINDS, SELECTION_SCOPES,
    type Package, type PackageKind, type SelectionScope,
} from "@/lib/api/packages"

interface Props {
    open: boolean
    onClose: () => void
    pkg: Package | null
    onSuccess: () => void
}

interface FormItem {
    product_id: number
    product_name: string
    sku: string
    /** Piezas por paquete. Solo aplica en paquetes predefinidos. */
    qty: string
}

interface FormState {
    name: string
    description: string
    kind: PackageKind
    price: string
    item_count: string
    selection_scope: SelectionScope
    category_id: string
    items: FormItem[]
}

const EMPTY: FormState = {
    name: "", description: "", kind: "fixed", price: "",
    item_count: "5", selection_scope: "any", category_id: "", items: [],
}

export function PackageDialog({ open, onClose, pkg, onSuccess }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [productSearch, setProductSearch] = useState("")
    const [searchOpen, setSearchOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const isMobile = useMediaQuery("(max-width: 639px)")

    useEffect(() => {
        if (!open) return
        setError("")
        setProductSearch("")
        setForm(pkg
            ? {
                name: pkg.name,
                description: pkg.description ?? "",
                kind: pkg.kind,
                price: toInputNumber(pkg.price),
                item_count: toInputNumber(pkg.item_count) || "5",
                selection_scope: pkg.selection_scope,
                category_id: pkg.category_id ? String(pkg.category_id) : "",
                items: pkg.items.map((i) => ({
                    product_id: i.product_id,
                    product_name: i.product_name,
                    sku: i.sku,
                    qty: toInputNumber(i.qty) || "1",
                })),
            }
            : EMPTY
        )
    }, [open, pkg])

    useEffect(() => {
        if (!open) return
        Promise.all([productsApi.list(), categoriesApi.list()])
            .then(([p, c]) => {
                setProducts(p.filter((x) => x.status === "active"))
                setCategories(c.filter((x) => x.status === "active"))
            })
            .catch(() => sileo.error({ title: "Error al cargar productos" }))
    }, [open])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const isFixed = form.kind === "fixed"
    // En un armable la lista solo se usa para restringir; con "cualquier
    // producto" o "por categoría" no hay nada que listar.
    const showItems = isFixed || form.selection_scope === "list"

    const filteredProducts = useMemo(() => {
        const chosen = new Set(form.items.map((i) => i.product_id))
        const available = products.filter((p) => !chosen.has(p.id))
        const q = productSearch.trim().toLowerCase()
        if (!q) return available.slice(0, 8)
        return available
            .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
            .slice(0, 8)
    }, [products, productSearch, form.items])

    const totalUnits = isFixed
        ? form.items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0)
        : Number(form.item_count) || 0

    const pricePerUnit = totalUnits > 0 ? (Number(form.price) || 0) / totalUnits : 0

    function addProduct(p: Product) {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { product_id: p.id, product_name: p.name, sku: p.sku, qty: "1" }],
        }))
        setProductSearch("")
        setSearchOpen(false)
    }

    function removeProduct(productId: number) {
        setForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.product_id !== productId) }))
    }

    function updateQty(productId: number, value: string) {
        const qty = onlyDigits(value)
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((i) => (i.product_id === productId ? { ...i, qty } : i)),
        }))
    }

    function validate(): string {
        if (!form.name.trim()) return "El nombre del paquete es requerido"
        if (!form.price || Number(form.price) < 0) return "Indica el precio del paquete"

        if (isFixed) {
            if (!form.items.length) return "Un paquete predefinido necesita al menos un producto"
            if (form.items.some((i) => !i.qty || Number(i.qty) <= 0))
                return "La cantidad de cada producto debe ser mayor a cero"
            return ""
        }

        if (!form.item_count || Number(form.item_count) <= 0)
            return "Indica cuántas piezas lleva el paquete"
        if (form.selection_scope === "category" && !form.category_id)
            return "Selecciona la categoría de la que saldrán los productos"
        if (form.selection_scope === "list" && !form.items.length)
            return "Agrega los productos que este paquete acepta"
        return ""
    }

    async function handleSubmit() {
        const problem = validate()
        if (problem) { setError(problem); return }

        setLoading(true)
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                kind: form.kind,
                price: Number(form.price),
                item_count: isFixed ? null : Number(form.item_count),
                selection_scope: isFixed ? "any" as const : form.selection_scope,
                category_id: !isFixed && form.selection_scope === "category" ? Number(form.category_id) : null,
                items: showItems
                    ? form.items.map((i) => ({ product_id: i.product_id, qty: isFixed ? Number(i.qty) : 1 }))
                    : [],
            }

            if (pkg) {
                await packagesApi.update(pkg.id, payload)
                sileo.success({ title: "Paquete actualizado" })
            } else {
                await packagesApi.create(payload)
                sileo.success({ title: "Paquete creado" })
            }
            onSuccess()
        } catch (err) {
            setError(getApiError(err, "Error al guardar el paquete"))
        } finally {
            setLoading(false)
        }
    }

    const selectedCategoryName = categories.find((c) => String(c.id) === form.category_id)?.name
        ?? "Selecciona categoría"

    const body = (
        <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b">
                <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                    pkg
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                )}>
                    <Boxes size={11} />
                    {pkg ? "Editar paquete" : "Nuevo paquete"}
                </span>
                <p className="text-base font-medium leading-snug text-foreground mt-1">
                    {pkg ? `Editando: ${pkg.name}` : "Define el paquete de mayoreo"}
                </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto">
                {/* Tipo */}
                <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                        Tipo de paquete
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        {PACKAGE_KINDS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm((p) => ({ ...p, kind: opt.value }))}
                                aria-pressed={form.kind === opt.value}
                                className={cn(
                                    "rounded-lg border px-3 py-2 text-left transition-colors",
                                    form.kind === opt.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                )}
                            >
                                <span className="block text-sm font-medium">{opt.label}</span>
                                <span className="block text-[11px] text-muted-foreground">{opt.hint}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nombre y precio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Ej. Paquete 5 piezas"
                            value={form.name}
                            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError("") }}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Precio del paquete <span className="text-destructive">*</span>
                        </Label>
                        <MoneyInput
                            value={form.price}
                            onValueChange={(v) => { setForm((p) => ({ ...p, price: v })); setError("") }}
                            placeholder="0.00"
                            className="text-right"
                        />
                    </div>
                </div>

                {/* Armable: cuántas piezas y de dónde salen */}
                {!isFixed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Piezas por paquete <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                inputMode="numeric"
                                value={form.item_count}
                                onChange={(e) => { setForm((p) => ({ ...p, item_count: onlyDigits(e.target.value) })); setError("") }}
                                placeholder="5"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Qué puede llevar
                            </Label>
                            <Select
                                value={form.selection_scope}
                                onValueChange={(v) => v && setForm((p) => ({ ...p, selection_scope: v as SelectionScope }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue>
                                        {SELECTION_SCOPES.find((s) => s.value === form.selection_scope)?.label}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {SELECTION_SCOPES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {!isFixed && form.selection_scope === "category" && (
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Categoría <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.category_id}
                            onValueChange={(v) => { if (v) { setForm((p) => ({ ...p, category_id: v })); setError("") } }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona categoría">{selectedCategoryName}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Contenido / lista permitida */}
                {showItems && (
                    <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            {isFixed ? "Contenido del paquete" : "Productos que acepta"}
                            <span className="text-destructive"> *</span>
                        </Label>

                        <div ref={searchRef} className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar producto por nombre o SKU..."
                                value={productSearch}
                                onChange={(e) => { setProductSearch(e.target.value); setSearchOpen(true) }}
                                onFocus={() => setSearchOpen(true)}
                                className="pl-9"
                            />
                            {searchOpen && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-lg overflow-hidden">
                                    <div className="max-h-52 overflow-y-auto">
                                        {filteredProducts.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => addProduct(p)}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
                                            >
                                                <PackageIcon size={13} className="text-primary shrink-0" />
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-sm font-medium truncate">{p.name}</span>
                                                    <span className="block text-xs text-muted-foreground font-mono">{p.sku}</span>
                                                </span>
                                                <Plus size={15} className="text-muted-foreground shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {searchOpen && productSearch && filteredProducts.length === 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-sm px-4 py-3 text-sm text-muted-foreground">
                                    Sin resultados para &quot;{productSearch}&quot;
                                </div>
                            )}
                        </div>

                        {form.items.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-lg">
                                {isFixed
                                    ? "Agrega los productos que trae el paquete"
                                    : "Agrega los productos entre los que se podrá elegir"}
                            </p>
                        ) : (
                            <div className="space-y-1 border rounded-lg p-2">
                                {form.items.map((item) => (
                                    <div key={item.product_id} className="flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{item.product_name}</p>
                                            <p className="text-[11px] text-muted-foreground font-mono">{item.sku}</p>
                                        </div>
                                        {isFixed && (
                                            <Input
                                                value={item.qty}
                                                onChange={(e) => updateQty(item.product_id, e.target.value)}
                                                inputMode="numeric"
                                                aria-label={`Piezas de ${item.product_name}`}
                                                className={cn("h-8 w-16 text-center text-sm",
                                                    (!item.qty || Number(item.qty) <= 0) && "border-destructive")}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(item.product_id)}
                                            aria-label={`Quitar ${item.product_name}`}
                                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                        Descripción
                    </Label>
                    <Input
                        placeholder="Notas para quien vende..."
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                </div>

                {error && (
                    <p className="text-[12px] text-destructive">{error}</p>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                    {totalUnits > 0 && Number(form.price) > 0
                        ? `${totalUnits} pieza(s) · ${formatCurrency(pricePerUnit)} c/u`
                        : "Precio fijo por paquete"}
                </p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-30">
                        {loading ? "Guardando..." : pkg ? "Guardar cambios" : "Crear paquete"}
                    </Button>
                </div>
            </div>
        </>
    )

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
                <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl max-h-[92dvh] flex flex-col">
                    <SheetTitle className="sr-only">{pkg ? "Editar paquete" : "Nuevo paquete"}</SheetTitle>
                    <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
                    {body}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-160 p-0 gap-0 overflow-hidden rounded-2xl max-h-[90dvh] flex flex-col">
                <DialogTitle className="sr-only">{pkg ? "Editar paquete" : "Nuevo paquete"}</DialogTitle>
                {body}
            </DialogContent>
        </Dialog>
    )
}
