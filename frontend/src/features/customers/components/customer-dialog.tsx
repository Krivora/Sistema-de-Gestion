"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { customersApi, type Customer, type CreateCustomerDto } from "@/lib/api/customers"
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
    customer: Customer | null
    onSuccess: () => void
}

const EMPTY: CreateCustomerDto = { name: "", phone: "", email: "", address: "" }

export function CustomerDialog({ open, onClose, customer, onSuccess }: Props) {
    const [form, setForm] = useState<CreateCustomerDto>(EMPTY)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setForm(
                customer
                    ? {
                        name: customer.name,
                        phone: customer.phone ?? "",
                        email: customer.email ?? "",
                        address: customer.address ?? "",
                    }
                    : EMPTY
            )
        }
    }, [open, customer])

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
            if (customer) {
                await customersApi.update(customer.id, form)
                sileo.success({ title: "Cliente actualizado" })
            } else {
                await customersApi.create(form)
                sileo.success({ title: "Cliente creado" })
            }
            onSuccess()
        } catch {
            sileo.error({ title: "Error al guardar cliente" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{customer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ej. Juan Pérez"
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
                            placeholder="juan@email.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Ej. Calle Principal 123"
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
                        {loading ? "Guardando..." : customer ? "Guardar cambios" : "Crear cliente"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}