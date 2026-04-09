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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ej. Laptop Dell XPS"
                            value={form.name}
                            onChange={handleChange}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div className="space-y-1.5">
                        <Label>
                            Categoría <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.category_id ? String(form.category_id) : ""}
                            onValueChange={(val) => {
                                setForm((prev) => ({ ...prev, category_id: Number(val) }))
                                setErrors((prev) => ({ ...prev, category_id: undefined }))
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && (
                            <p className="text-xs text-destructive">{errors.category_id}</p>
                        )}
                    </div>

                    {/* SKU */}
                    <div className="space-y-1.5">
                        <Label htmlFor="sku">
                            SKU{" "}
                            <span className="text-xs text-muted-foreground">(opcional, se autogenera)</span>
                        </Label>
                        <Input
                            id="sku"
                            name="sku"
                            placeholder="Ej. ELEC-0001"
                            value={form.sku}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Descripción opcional del producto"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}