"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { suppliersApi, type Supplier, type CreateSupplierDto } from "@/lib/api/suppliers"
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
    supplier: Supplier | null
    onSuccess: () => void
}

const EMPTY: CreateSupplierDto = { name: "", phone: "", email: "", address: "" }

export function SupplierDialog({ open, onClose, supplier, onSuccess }: Props) {
    const [form, setForm] = useState<CreateSupplierDto>(EMPTY)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setForm(
                supplier
                    ? {
                        name: supplier.name,
                        phone: supplier.phone ?? "",
                        email: supplier.email ?? "",
                        address: supplier.address ?? "",
                    }
                    : EMPTY
            )
        }
    }, [open, supplier])

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
            if (supplier) {
                await suppliersApi.update(supplier.id, form)
                sileo.success({ title: "Proveedor actualizado" })
            } else {
                await suppliersApi.create(form)
                sileo.success({ title: "Proveedor creado" })
            }
            onSuccess()
        } catch {
            sileo.error({ title: "Error al guardar proveedor" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{supplier ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ej. Distribuidora Norte"
                            value={form.name}
                            onChange={handleChange}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="Ej. 6441234567"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="contacto@proveedor.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Ej. Bodega Industrial 456"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando..." : supplier ? "Guardar cambios" : "Crear proveedor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}