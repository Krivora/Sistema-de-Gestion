"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { branchesApi, type Branch, type CreateBranchDto } from "@/lib/api/branches"
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
    branch: Branch | null
    onSuccess: () => void
}

const EMPTY: CreateBranchDto = { name: "", address: "", phone: "", code: "" }

export function BranchDialog({ open, onClose, branch, onSuccess }: Props) {
    const [form, setForm] = useState<CreateBranchDto>(EMPTY)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setForm(
                branch
                    ? {
                        name: branch.name,
                        address: branch.address ?? "",
                        phone: branch.phone ?? "",
                        code: branch.code,
                    }
                    : EMPTY
            )
        }
    }, [open, branch])

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
            if (branch) {
                await branchesApi.update(branch.id, {
                    name: form.name,
                    address: form.address,
                    phone: form.phone,
                    code: form.code,
                })
                sileo.success({ title: "Sucursal actualizada" })
            } else {
                await branchesApi.create(form)
                sileo.success({ title: "Sucursal creada" })
            }
            onSuccess()
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? "Error al guardar sucursal"
            sileo.error({ title: msg })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{branch ? "Editar sucursal" : "Nueva sucursal"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ej. Sucursal Centro"
                            value={form.name}
                            onChange={handleChange}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="code">
                            Código{" "}
                            <span className="text-xs text-muted-foreground">(opcional, se autogenera)</span>
                        </Label>
                        <Input
                            id="code"
                            name="code"
                            placeholder="Ej. CEN-001"
                            value={form.code}
                            onChange={handleChange}
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
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Ej. Av. Principal 123"
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
                        {loading ? "Guardando..." : branch ? "Guardar cambios" : "Crear sucursal"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}