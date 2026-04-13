"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { customersApi, type Customer, type CreateCustomerDto } from "@/lib/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Props {
    open: boolean
    onClose: () => void
    customer: Customer | null
    onSuccess: () => void
}

const EMPTY: CreateCustomerDto = { name: "", phone: "", email: "", address: "" }

export function CustomerDialog({ open, onClose, customer, onSuccess }: Props) {
    const isEdit = !!customer
    const [form, setForm] = useState<CreateCustomerDto>(EMPTY)
    const [errors, setErrors] = useState<Partial<Record<keyof CreateCustomerDto, string>>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setErrors({})
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

    function set(field: keyof CreateCustomerDto, value: string) {
        setForm((p) => ({ ...p, [field]: value }))
        if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
    }

    function validate(): boolean {
        const e: typeof errors = {}
        if (!form.name.trim()) e.name = "El nombre es requerido"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
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

    // Progreso: solo nombre es requerido
    const filledRequired = form.name.trim() ? 1 : 0
    const progress = filledRequired * 100

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b">
                    <div className="space-y-1">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                            isEdit
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        )}>
                            {isEdit ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            )}
                            {isEdit ? "Editar cliente" : "Nuevo cliente"}
                        </span>
                        <DialogTitle className="text-base font-medium leading-snug text-foreground">
                            {isEdit
                                ? customer.name
                                : form.name.trim()
                                    ? form.name
                                    : "¿Cómo se llama el cliente?"}
                        </DialogTitle>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="h-0.5 bg-border">
                    <div
                        className="h-full transition-all duration-300 rounded-r-full bg-emerald-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="px-6 py-5 space-y-4">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Ej. Juan Pérez"
                            value={form.name}
                            autoFocus
                            onChange={(e) => set("name", e.target.value)}
                            className={cn(errors.name && "border-destructive")}
                        />
                        {errors.name && (
                            <p className="text-[11px] text-destructive flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Teléfono + Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Teléfono
                            </Label>
                            <Input
                                placeholder="6441234567"
                                value={form.phone}
                                inputMode="tel"
                                onChange={(e) => set("phone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Email
                            </Label>
                            <Input
                                type="email"
                                placeholder="juan@email.com"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Dirección
                        </Label>
                        <Input
                            placeholder="Ej. Calle Principal 123"
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn(
                        "text-xs transition-colors",
                        progress === 100
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground"
                    )}>
                        {progress === 100 ? "✓ Listo para guardar" : "Nombre requerido"}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-32">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Guardando...
                                </span>
                            ) : isEdit ? "Guardar cambios" : "Crear cliente"}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}