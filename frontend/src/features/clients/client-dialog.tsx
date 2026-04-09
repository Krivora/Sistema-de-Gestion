"use client"
import { useEffect, useState } from "react"
import { clientsApi, type Client, type CreateClientDto, type UpdateClientDto } from "@/lib/api/clients"
import { sileo } from "sileo"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Props {
    open: boolean
    onClose: () => void
    client: Client | null
    onSuccess: () => void
}

const EMPTY = {
    name: "", business_name: "", email: "", phone: "",
    max_users: 5, max_branches: 1,
    admin_name: "", admin_email: "", admin_password: "",
}

export function ClientDialog({ open, onClose, client, onSuccess }: Props) {
    const isEdit = !!client
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (client) {
            setForm({
                name: client.name,
                business_name: client.business_name ?? "",
                email: client.email ?? "",
                phone: client.phone ?? "",
                max_users: client.max_users,
                max_branches: client.max_branches,
                admin_name: "", admin_email: "", admin_password: "",
            })
        } else {
            setForm(EMPTY)
        }
    }, [client, open])

    function set(field: string, value: string | number) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Info del cliente */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 col-span-2">
                                <Label>Nombre *</Label>
                                <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label>Razón social</Label>
                                <Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Teléfono</Label>
                                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Máx. usuarios</Label>
                                <Input type="number" min={1} value={form.max_users} onChange={(e) => set("max_users", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Máx. sucursales</Label>
                                <Input type="number" min={1} value={form.max_branches} onChange={(e) => set("max_branches", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Admin — solo en creación */}
                    {!isEdit && (
                        <>
                            <Separator />
                            <p className="text-sm font-medium text-muted-foreground">Usuario administrador</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5 col-span-2">
                                    <Label>Nombre del admin *</Label>
                                    <Input value={form.admin_name} onChange={(e) => set("admin_name", e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Email del admin *</Label>
                                    <Input type="email" value={form.admin_email} onChange={(e) => set("admin_email", e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Contraseña *</Label>
                                    <Input type="password" value={form.admin_password} onChange={(e) => set("admin_password", e.target.value)} required />
                                </div>
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}