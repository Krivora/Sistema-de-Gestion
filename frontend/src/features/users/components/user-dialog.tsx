"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { usersApi, type User, type CreateUserDto, type UpdateUserDto } from "@/lib/api/users"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { getApiError } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Role { id: number; name: string }

interface Props {
    open: boolean
    onClose: () => void
    user: User | null
    onSuccess: () => void
}

const EMPTY: CreateUserDto = { name: "", email: "", password: "", role_id: "", branch_id: "" }

// Roles hardcoded — si tienes rolesApi puedes reemplazarlo
const DEFAULT_ROLES: Role[] = [
    { id: 2, name: "admin" },
    { id: 3, name: "user" },
]

export function UserDialog({ open, onClose, user, onSuccess }: Props) {
    const [form, setForm] = useState<CreateUserDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => { branchesApi.list().then(setBranches) }, [])

    useEffect(() => {
        if (open) {
            setErrors({})
            setForm(user ? { name: user.name, email: user.email, password: "", role_id: user.role_id, branch_id: user.branch_id ?? "" } : EMPTY)
        }
    }, [open, user])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
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
                const data: UpdateUserDto = { name: form.name, email: form.email, role_id: form.role_id as number, branch_id: form.branch_id ? form.branch_id as number : null }
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

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{user ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
                        <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Ej. María García" autoFocus />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@empresa.com" />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password">{user ? "Nueva contraseña" : "Contraseña"} {!user && <span className="text-destructive">*</span>}</Label>
                        <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder={user ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"} />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Rol <span className="text-destructive">*</span></Label>
                        <Select value={String(form.role_id)} onValueChange={(v) => { setForm((p) => ({ ...p, role_id: Number(v) })); setErrors((p) => ({ ...p, role_id: undefined })) }}>
                            <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                            <SelectContent>
                                {DEFAULT_ROLES.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.role_id && <p className="text-xs text-destructive">{errors.role_id}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Sucursal <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                        <Select value={String(form.branch_id ?? "")} onValueChange={(v) => setForm((p) => ({ ...p, branch_id: v ? Number(v) : "" }))}>
                            <SelectTrigger><SelectValue placeholder="Sin sucursal asignada" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin sucursal</SelectItem>
                                {branches.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : user ? "Guardar cambios" : "Crear usuario"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}