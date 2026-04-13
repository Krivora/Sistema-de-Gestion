"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { usersApi, type User, type CreateUserDto, type UpdateUserDto } from "@/lib/api/users"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { getApiError } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Role { id: number; name: string }

interface Props {
    open: boolean
    onClose: () => void
    user: User | null
    onSuccess: () => void
}

const EMPTY: CreateUserDto = {
    name: "",
    email: "",
    password: "",
    role_id: "",
    branch_id: "",
}

const DEFAULT_ROLES: Role[] = [
    { id: 2, name: "admin" },
    { id: 3, name: "user" },
]

export function UserDialog({ open, onClose, user, onSuccess }: Props) {
    const [form, setForm] = useState<CreateUserDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        branchesApi.list().then(setBranches)
    }, [])

    useEffect(() => {
        if (open) {
            setErrors({})
            setForm(
                user
                    ? {
                        name: user.name,
                        email: user.email,
                        password: "",
                        role_id: user.role_id,
                        branch_id: user.branch_id ?? "",
                    }
                    : EMPTY
            )
        }
    }, [open, user])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    function validate(): boolean {
        const e: typeof errors = {}
        if (!form.name.trim()) e.name = "El nombre es requerido"
        if (!form.email.trim()) e.email = "El email es requerido"
        if (!user && !form.password.trim()) e.password = "La contraseña es requerida"
        if (!form.role_id) e.role_id = "Selecciona un rol"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            if (user) {
                const data: UpdateUserDto = {
                    name: form.name,
                    email: form.email,
                    role_id: Number(form.role_id),
                    branch_id: form.branch_id ? Number(form.branch_id) : null,
                }
                await usersApi.update(user.id, data)
                sileo.success({ title: "Usuario actualizado" })
            } else {
                await usersApi.create(form)
                sileo.success({ title: "Usuario creado" })
            }
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al guardar usuario") })
        } finally {
            setLoading(false)
        }
    }

    const isEdit = !!user

    const filledRequired = [
        form.name,
        form.email,
        isEdit ? "ok" : form.password,
        form.role_id,
    ].filter((v) => v !== "" && v !== undefined).length

    const progress = Math.round((filledRequired / 4) * 100)

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b">
                    <div className="space-y-1">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                                isEdit
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            )}
                        >
                            {isEdit ? "Editar usuario" : "Nuevo usuario"}
                        </span>

                        <DialogTitle className="text-base font-medium leading-snug">
                            {isEdit
                                ? `Actualizar información de ${user.name}`
                                : "Registrar un nuevo usuario"}
                        </DialogTitle>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="h-0.5 bg-border">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Contenido */}
                <div className="px-6 py-5 space-y-4">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ej. María García"
                            className={cn(errors.name && "border-destructive")}
                        />
                        {errors.name && (
                            <p className="text-[11px] text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="correo@empresa.com"
                            className={cn(errors.email && "border-destructive")}
                        />
                        {errors.email && (
                            <p className="text-[11px] text-destructive">{errors.email}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            {isEdit ? "Nueva contraseña" : "Contraseña"}
                            {!isEdit && <span className="text-destructive"> *</span>}
                        </Label>
                        <Input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder={
                                isEdit
                                    ? "Dejar vacío para no cambiar"
                                    : "Mínimo 6 caracteres"
                            }
                            className={cn(errors.password && "border-destructive")}
                        />
                        {errors.password && (
                            <p className="text-[11px] text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Rol y Sucursal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Rol */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Rol <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={String(form.role_id || "")}
                                onValueChange={(v) =>
                                    setForm((p) => ({ ...p, role_id: Number(v) }))
                                }
                            >
                                <SelectTrigger
                                    className={cn(
                                        "w-full md:w-50",
                                        errors.role_id && "border-destructive"
                                    )}
                                >
                                    <SelectValue placeholder="Selecciona un rol">
                                        {form.role_id
                                            ? DEFAULT_ROLES.find(
                                                (r) => r.id === Number(form.role_id)
                                            )?.name
                                            : "Selecciona un rol"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="md:w-50">
                                    {DEFAULT_ROLES.map((r) => (
                                        <SelectItem key={r.id} value={String(r.id)}>
                                            <span className="block truncate">{r.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role_id && (
                                <p className="text-[11px] text-destructive">
                                    {errors.role_id}
                                </p>
                            )}
                        </div>

                        {/* Sucursal */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Sucursal
                            </Label>
                            <Select
                                value={form.branch_id ? String(form.branch_id) : ""}
                                onValueChange={(v) =>
                                    setForm((p) => ({
                                        ...p,
                                        branch_id: v ? Number(v) : "",
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full md:w-50">
                                    <SelectValue placeholder="Sin sucursal">
                                        {!form.branch_id
                                            ? "Sin sucursal"
                                            : branches.find(
                                                (b) => b.id === Number(form.branch_id)
                                            )?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="md:w-50">
                                    <SelectItem value="">Sin sucursal</SelectItem>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            <span className="block truncate">{b.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <p
                        className={cn(
                            "text-xs",
                            progress === 100
                                ? "text-emerald-600 font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        {progress === 100
                            ? "✓ Listo para guardar"
                            : `${filledRequired}/4 campos requeridos`}
                    </p>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading}>
                            {loading
                                ? "Guardando..."
                                : isEdit
                                    ? "Guardar cambios"
                                    : "Crear usuario"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}