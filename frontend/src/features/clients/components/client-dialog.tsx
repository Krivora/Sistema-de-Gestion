"use client"
import { useEffect, useState } from "react"
import { clientsApi, type Client, type CreateClientDto, type UpdateClientDto } from "@/lib/api/clients"
import { sileo } from "sileo"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Props {
    open: boolean
    onClose: () => void
    client: Client | null
    onSuccess: () => void
}

const EMPTY = {
    name: "", business_name: "", email: "", phone: "",
    max_users: "", max_branches: "",
    admin_name: "", admin_email: "", admin_password: "",
}

export function ClientDialog({ open, onClose, client, onSuccess }: Props) {
    const isEdit = !!client
    const [form, setForm] = useState(EMPTY)
    const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({})
    const [loading, setLoading] = useState(false)
    const [adminOpen, setAdminOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (open) {
            setErrors({})
            setAdminOpen(false)
            setShowPassword(false)
            if (client) {
                setForm({
                    name: client.name,
                    business_name: client.business_name ?? "",
                    email: client.email ?? "",
                    phone: client.phone ?? "",
                    max_users: String(client.max_users),
                    max_branches: String(client.max_branches),
                    admin_name: "", admin_email: "", admin_password: "",
                })
            } else {
                setForm(EMPTY)
            }
        }
    }, [client, open])

    function set(field: keyof typeof EMPTY, value: string) {
        setForm((f) => ({ ...f, [field]: value }))
        if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
    }

    function validate(): boolean {
        const e: typeof errors = {}
        if (!form.name.trim()) e.name = "El nombre es requerido"
        if (!form.max_users || Number(form.max_users) < 1) e.max_users = "Mínimo 1 usuario"
        if (!form.max_branches || Number(form.max_branches) < 1) e.max_branches = "Mínimo 1 sucursal"
        if (!isEdit) {
            if (!form.admin_name.trim()) e.admin_name = "Nombre del admin requerido"
            if (!form.admin_email.trim()) e.admin_email = "Email del admin requerido"
            if (!form.admin_password.trim()) e.admin_password = "Contraseña requerida"
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            if (isEdit) {
                const data: UpdateClientDto = {
                    name: form.name,
                    business_name: form.business_name,
                    email: form.email,
                    phone: form.phone,
                    max_users: Number(form.max_users),
                    max_branches: Number(form.max_branches),
                }
                await clientsApi.update(client.id, data)
                sileo.success({ title: "Cliente actualizado" })
            } else {
                const data: CreateClientDto = {
                    name: form.name,
                    business_name: form.business_name,
                    email: form.email,
                    phone: form.phone,
                    max_users: Number(form.max_users),
                    max_branches: Number(form.max_branches),
                    admin_name: form.admin_name,
                    admin_email: form.admin_email,
                    admin_password: form.admin_password,
                }
                await clientsApi.create(data)
                sileo.success({ title: "Cliente creado correctamente" })
            }
            onSuccess()
        } catch {
            sileo.error({ title: isEdit ? "Error al actualizar" : "Error al crear cliente" })
        } finally {
            setLoading(false)
        }
    }

    // Progreso: name, email, max_users, max_branches (+ admin fields si create)
    const requiredFields = isEdit
        ? [form.name, form.max_users, form.max_branches]
        : [form.name, form.max_users, form.max_branches, form.admin_name, form.admin_email, form.admin_password]
    const filledRequired = requiredFields.filter((v) => v !== "").length
    const progress = Math.round((filledRequired / requiredFields.length) * 100)

    const ErrorMsg = ({ field }: { field: keyof typeof EMPTY }) =>
        errors[field] ? (
            <p className="text-[11px] text-destructive flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors[field]}
            </p>
        ) : null

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">

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
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            )}
                            {isEdit ? "Editar cliente" : "Nuevo cliente"}
                        </span>
                        <DialogTitle className="text-base font-medium leading-snug text-foreground">
                            {isEdit
                                ? client.name
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

                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Empresa Demo"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            className={cn(errors.name && "border-destructive")}
                        />
                        <ErrorMsg field="name" />
                    </div>

                    {/* Razón social */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Razón social
                        </Label>
                        <Input
                            placeholder="Empresa Demo SA de CV"
                            value={form.business_name}
                            onChange={(e) => set("business_name", e.target.value)}
                        />
                    </div>

                    {/* Email + Teléfono */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Email
                            </Label>
                            <Input
                                type="email"
                                placeholder="contacto@empresa.com"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                className={cn(errors.email && "border-destructive")}
                            />
                            <ErrorMsg field="email" />
                        </div>
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
                    </div>

                    {/* Límites del plan */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Máx. usuarios <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                placeholder="5"
                                value={form.max_users}
                                inputMode="numeric"
                                onChange={(e) => set("max_users", e.target.value.replace(/\D/g, ""))}
                                className={cn(errors.max_users && "border-destructive")}
                            />
                            <ErrorMsg field="max_users" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Máx. sucursales <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                placeholder="1"
                                value={form.max_branches}
                                inputMode="numeric"
                                onChange={(e) => set("max_branches", e.target.value.replace(/\D/g, ""))}
                                className={cn(errors.max_branches && "border-destructive")}
                            />
                            <ErrorMsg field="max_branches" />
                        </div>
                    </div>

                    {/* Admin — solo en creación */}
                    {!isEdit && (
                        <>
                            {/* Toggle sección admin */}
                            <button
                                type="button"
                                onClick={() => setAdminOpen((p) => !p)}
                                className="w-full flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                            >
                                <span className="flex-1 h-px bg-border" />
                                Usuario administrador
                                <svg
                                    xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className={cn("transition-transform duration-200", adminOpen && "rotate-180")}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                                <span className="flex-1 h-px bg-border" />
                            </button>

                            <div className={cn(
                                "space-y-4 overflow-hidden transition-all duration-200",
                                adminOpen ? "grid-rows-[1fr] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                            )}>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                        Nombre del admin <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Admin Principal"
                                        value={form.admin_name}
                                        onChange={(e) => set("admin_name", e.target.value)}
                                        className={cn(errors.admin_name && "border-destructive")}
                                    />
                                    <ErrorMsg field="admin_name" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                            Email del admin <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            type="email"
                                            placeholder="admin@empresa.com"
                                            value={form.admin_email}
                                            onChange={(e) => set("admin_email", e.target.value)}
                                            className={cn(errors.admin_email && "border-destructive")}
                                        />
                                        <ErrorMsg field="admin_email" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                            Contraseña <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={form.admin_password}
                                                onChange={(e) => set("admin_password", e.target.value)}
                                                className={cn("pr-9", errors.admin_password && "border-destructive")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((p) => !p)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <ErrorMsg field="admin_password" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn(
                        "text-xs transition-colors",
                        progress === 100
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground"
                    )}>
                        {progress === 100
                            ? "✓ Listo para guardar"
                            : `${filledRequired}/${requiredFields.length} campos requeridos`}
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