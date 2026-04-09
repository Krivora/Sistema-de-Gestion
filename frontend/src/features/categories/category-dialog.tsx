"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { categoriesApi, type Category, type CreateCategoryDto } from "@/lib/api/categories"
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

interface Props {
    open: boolean
    onClose: () => void
    category: Category | null
    onSuccess: () => void
}

const EMPTY: CreateCategoryDto = { name: "", description: "", code: "" }

export function CategoryDialog({ open, onClose, category, onSuccess }: Props) {
    const [form, setForm] = useState<CreateCategoryDto>(EMPTY)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setForm(
                category
                    ? { name: category.name, description: category.description ?? "", code: category.code }
                    : EMPTY
            )
        }
    }, [open, category])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit() {
        if (!form.name.trim()) {
            sileo.error({ title: "El nombre es requerido" })
            return
        }
        setLoading(true)
        try {
            if (category) {
                await categoriesApi.update(category.id, { name: form.name, description: form.description })
                sileo.success({ title: "Categoría actualizada" })
            } else {
                await categoriesApi.create(form)
                sileo.success({ title: "Categoría creada" })
            }
            onSuccess()
        } catch {
            sileo.error({ title: "Error al guardar categoría" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ej. Electrónica"
                            value={form.name}
                            onChange={handleChange}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Descripción opcional"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    {!category && (
                        <div className="space-y-1.5">
                            <Label htmlFor="code">
                                Código{" "}
                                <span className="text-xs text-muted-foreground">(opcional, se autogenera)</span>
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="Ej. ELEC-001"
                                value={form.code}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando..." : category ? "Guardar cambios" : "Crear categoría"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}