// features/products/components/product-dialog.tsx
"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { productsApi, type Product, type CreateProductDto } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Props {
    open: boolean
    onClose: () => void
    product: Product | null
    onSuccess: () => void
}

const EMPTY: CreateProductDto = { name: "", description: "", sku: "" }

function ProductForm({
    form, product, loading, nameError, optionalOpen,
    onChangeInput, onToggleOptional, onSubmit, onClose,
}: {
    form: CreateProductDto
    product: Product | null
    loading: boolean
    nameError: string
    optionalOpen: boolean
    onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void
    onToggleOptional: () => void
    onSubmit: () => void
    onClose: () => void
}) {
    const nameFilled = !!form.name.trim()

    return (
        <>
            {/* header */}
            <div className="px-6 pt-5 pb-4 border-b">
                <div className="space-y-1">
                    <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                        product
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    )}>
                        {product ? "Editar producto" : "Nuevo producto"}
                    </span>
                    <p className="text-base font-medium leading-snug text-foreground">
                        {product ? `Editando: ${product.name}` : "¿Cómo se llama el producto?"}
                    </p>
                </div>
            </div>

            {/* progress */}
            <div className="h-0.5 bg-border relative">
                <div
                    className="h-full transition-all duration-300 rounded-r-full"
                    style={{ width: nameFilled ? "100%" : "0%", background: nameFilled ? "rgb(16 185 129)" : "transparent" }}
                />
            </div>

            {/* body */}
            <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                        Nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        name="name"
                        placeholder="Ej. Laptop Pro"
                        value={form.name}
                        onChange={onChangeInput}
                        autoFocus
                        className={cn("text-[15px] h-10", nameError && "border-destructive focus-visible:ring-destructive")}
                    />
                    {nameError && (
                        <p className="text-[11px] text-destructive">{nameError}</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onToggleOptional}
                    className="w-full flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                    <span className="flex-1 h-px bg-border" />
                    Campos opcionales
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={cn("transition-transform duration-200", optionalOpen && "rotate-180")}>
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                    <span className="flex-1 h-px bg-border" />
                </button>

                <div className={cn(
                    "grid gap-4 overflow-hidden transition-all duration-200",
                    !product ? "grid-cols-2" : "grid-cols-1",
                    optionalOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                    <div className="overflow-hidden space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Descripción</Label>
                        <Input name="description" placeholder="Descripción breve..." value={form.description} onChange={onChangeInput} />
                    </div>
                    {!product && (
                        <div className="overflow-hidden space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">SKU</Label>
                            <Input name="sku" placeholder="PROD-001" value={form.sku} onChange={onChangeInput} className="font-mono text-sm" />
                            <p className="text-[11px] text-muted-foreground">Se autogenera si vacío</p>
                        </div>
                    )}
                </div>
            </div>

            {/* footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                <p className={cn("text-xs transition-colors", nameFilled ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                    {nameFilled ? "✓ Listo para guardar" : "Completa el nombre para continuar"}
                </p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button size="sm" onClick={onSubmit} disabled={loading} className="min-w-30">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Guardando...
                            </span>
                        ) : product ? "Guardar cambios" : "Crear producto"}
                    </Button>
                </div>
            </div>
        </>
    )
}

export function ProductDialog({ open, onClose, product, onSuccess }: Props) {
    const [form, setForm] = useState<CreateProductDto>(EMPTY)
    const [loading, setLoading] = useState(false)
    const [nameError, setNameError] = useState("")
    const [optionalOpen, setOptionalOpen] = useState(false)
    const isMobile = useMediaQuery("(max-width: 639px)")

    useEffect(() => {
        if (open) {
            setNameError("")
            setOptionalOpen(false)
            setForm(product
                ? { name: product.name, description: product.description ?? "", sku: product.sku }
                : EMPTY
            )
        }
    }, [open, product])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (name === "name" && nameError) setNameError("")
    }

    async function handleSubmit() {
        if (!form.name.trim()) { setNameError("El nombre es requerido"); return }
        setLoading(true)
        try {
            if (product) {
                await productsApi.update(product.id, { name: form.name, description: form.description })
                sileo.success({ title: "Producto actualizado" })
            } else {
                await productsApi.create(form)
                sileo.success({ title: "Producto creado" })
            }
            onSuccess()
        } catch {
            sileo.error({ title: "Error al guardar producto" })
        } finally {
            setLoading(false)
        }
    }

    const formProps = {
        form, product, loading, nameError, optionalOpen,
        onChangeInput: handleChange,
        onToggleOptional: () => setOptionalOpen((p) => !p),
        onSubmit: handleSubmit,
        onClose,
    }

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
                <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl max-h-[92dvh] flex flex-col">
                    <SheetTitle className="sr-only">{product ? "Editar producto" : "Nuevo producto"}</SheetTitle>
                    <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
                    <ProductForm {...formProps} />
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-115 p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogTitle className="sr-only">{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
                <ProductForm {...formProps} />
            </DialogContent>
        </Dialog>
    )
}