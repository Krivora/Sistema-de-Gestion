"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { productsApi, type Product, type CreateProductDto } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { getApiError } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Props {
    open: boolean
    onClose: () => void
    product: Product | null
    onSuccess: () => void
}


const EMPTY: CreateProductDto = { name: "", description: "", category_id: "", sku: "" }
export function ProductDialog({ open, onClose, product, onSuccess }: Props) {
    const [form, setForm] = useState<CreateProductDto>(EMPTY)
    const [categories, setCategories] = useState<Category[]>([])
    const [errors, setErrors] = useState<Partial<Record<keyof CreateProductDto, string>>>({})
    const [loading, setLoading] = useState(false)
    const [optionalOpen, setOptionalOpen] = useState(false)
    const filledRequired = [form.name.trim(), form.category_id].filter(Boolean).length
    const allFilled = filledRequired === 2
    const SELECT_WIDTH = "w-full";
    // Cargar categorías activas
    useEffect(() => {
        categoriesApi.list().then((data) =>
            setCategories(data.filter((c) => c.status === "active"))
        )
    }, [])

    useEffect(() => {
        if (open) {
            setErrors({})
            setForm(
                product
                    ? {
                        name: product.name,
                        description: product.description ?? "",
                        category_id: product.category_id,
                        sku: product.sku,
                    }
                    : EMPTY
            )
        }
    }, [open, product])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        // Limpiar error del campo al escribir
        if (errors[name as keyof CreateProductDto]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    function validate(): boolean {
        const newErrors: typeof errors = {}
        if (!form.name.trim()) newErrors.name = "El nombre es requerido"
        if (!form.category_id) newErrors.category_id = "Selecciona una categoría"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            if (product) {
                await productsApi.update(product.id, {
                    name: form.name,
                    description: form.description,
                    category_id: form.category_id as number,
                    sku: form.sku || undefined,
                })
                sileo.success({ title: "Producto actualizado" })
            } else {
                await productsApi.create({
                    ...form,
                    sku: form.sku || undefined,
                })
                sileo.success({ title: "Producto creado" })
            }
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al guardar producto") })
        } finally {
            setLoading(false)
        }
    }
    const selectedCategory = categories.find(
        (c) => String(c.id) === String(form.category_id)
    )

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-115 p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                            product
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        )}>
                            {product ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            )}
                            {product ? "Editar producto" : "Nuevo producto"}
                        </span>
                        <DialogTitle className="text-base font-medium leading-snug text-foreground">
                            {product ? `Editando: ${product.name}` : "¿Qué producto vas a registrar?"}
                        </DialogTitle>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="h-0.5 bg-border relative">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-r-full"
                        style={{ width: `${(filledRequired / 2) * 100}%` }}
                    />
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            name="name"
                            placeholder="Ej. Laptop Dell XPS 15"
                            value={form.name}
                            onChange={handleChange}
                            autoFocus
                            className={cn("text-[15px] h-10", errors.name && "border-destructive focus-visible:ring-destructive")}
                        />
                        {errors.name && (
                            <p className="text-[11px] text-destructive flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Categoría <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.category_id ? String(form.category_id) : ""}
                            onValueChange={(val) => {
                                setForm((prev) => ({ ...prev, category_id: Number(val) }))
                                setErrors((prev) => ({ ...prev, category_id: undefined }))
                            }}
                        >
                            <SelectTrigger
                                className={`${SELECT_WIDTH} ${errors.category_id
                                    ? "border-destructive focus:ring-destructive"
                                    : ""
                                    }`}
                            >
                                <SelectValue
                                    placeholder="Selecciona una categoría"
                                    className="truncate"
                                >
                                    {selectedCategory?.name ?? "Selecciona una categoría"}
                                </SelectValue>
                            </SelectTrigger>

                            <SelectContent className="md:w-65">
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        <span className="block truncate">{cat.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && (
                            <p className="text-[11px] text-destructive flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    {/* Toggle campos opcionales */}
                    <button
                        type="button"
                        onClick={() => setOptionalOpen((p) => !p)}
                        className="w-full flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                    >
                        <span className="flex-1 h-px bg-border" />
                        Campos opcionales
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12" height="12"
                            viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                            className={cn("transition-transform duration-200", optionalOpen && "rotate-180")}
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                        <span className="flex-1 h-px bg-border" />
                    </button>

                    {/* Opcionales colapsables */}
                    <div
                        className={cn(
                            "grid gap-4 overflow-hidden transition-all duration-300 ease-in-out",
                            "grid-cols-1 md:grid-cols-[4fr_2fr]",
                            optionalOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="description"
                                className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground"
                            >
                                Descripción
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Descripción breve..."
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="sku"
                                className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground"
                            >
                                SKU
                            </Label>
                            <Input
                                id="sku"
                                name="sku"
                                placeholder="ELEC-0001"
                                value={form.sku}
                                onChange={handleChange}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Se autogenera si vacío
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn("text-xs transition-colors", allFilled ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                        {allFilled ? "✓ Listo para guardar" : `${filledRequired}/2 campos requeridos`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-30">
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

            </DialogContent>
        </Dialog>
    )
}