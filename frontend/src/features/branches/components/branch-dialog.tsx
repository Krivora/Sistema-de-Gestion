"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { branchesApi, type Branch, type CreateBranchDto } from "@/lib/api/branches"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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
    const [nameError, setNameError] = useState("")
    const [optionalOpen, setOptionalOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setNameError("")
            setOptionalOpen(false)
            setForm(branch ? { name: branch.name, address: branch.address ?? "", phone: branch.phone ?? "", code: branch.code } : EMPTY)
        }
    }, [open, branch])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (name === "name" && nameError) setNameError("")
    }

    async function handleSubmit() {
        if (!form.name.trim()) { setNameError("El nombre es requerido"); return }
        setLoading(true)
        try {
            if (branch) {
                await branchesApi.update(branch.id, { name: form.name, address: form.address, phone: form.phone, code: form.code })
                sileo.success({ title: "Sucursal actualizada" })
            } else {
                await branchesApi.create(form)
                sileo.success({ title: "Sucursal creada" })
            }
            onSuccess()
        } catch (err: any) {
            sileo.error({ title: err?.response?.data?.error ?? "Error al guardar sucursal" })
        } finally {
            setLoading(false)
        }
    }

    const nameFilled = !!form.name.trim()

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden rounded-2xl">

                <div className="px-6 pt-5 pb-4 border-b">
                    <div className="space-y-1">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                            branch ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                   : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        )}>
                            {branch ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            )}
                            {branch ? "Editar sucursal" : "Nueva sucursal"}
                        </span>
                        <DialogTitle className="text-base font-medium leading-snug text-foreground">
                            {branch ? `Editando: ${branch.name}` : "¿Cómo se llama la sucursal?"}
                        </DialogTitle>
                    </div>
                </div>

                <div className="h-0.5 bg-border">
                    <div className="h-full transition-all duration-300 rounded-r-full"
                        style={{ width: nameFilled ? "100%" : "0%", background: nameFilled ? "rgb(16 185 129)" : "transparent" }} />
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input name="name" placeholder="Ej. Sucursal Centro" value={form.name} onChange={handleChange} autoFocus
                            className={cn("text-[15px] h-10", nameError && "border-destructive focus-visible:ring-destructive")} />
                        {nameError && (
                            <p className="text-[11px] text-destructive flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {nameError}
                            </p>
                        )}
                    </div>

                    <button type="button" onClick={() => setOptionalOpen((p) => !p)}
                        className="w-full flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
                        <span className="flex-1 h-px bg-border" />
                        Campos opcionales
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={cn("transition-transform duration-200", optionalOpen && "rotate-180")}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                        <span className="flex-1 h-px bg-border" />
                    </button>

                    <div className={cn("grid grid-cols-2 gap-4 overflow-hidden transition-all duration-200",
                        optionalOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                        <div className="overflow-hidden space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Código</Label>
                            <Input name="code" placeholder="CEN-001" value={form.code} onChange={handleChange} className="font-mono text-sm" />
                            <p className="text-[11px] text-muted-foreground">Se autogenera si vacío</p>
                        </div>
                        <div className="overflow-hidden space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Teléfono</Label>
                            <Input name="phone" placeholder="6441234567" value={form.phone} onChange={handleChange} />
                        </div>
                        <div className="overflow-hidden space-y-1.5 col-span-2">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Dirección</Label>
                            <Input name="address" placeholder="Av. Principal 123" value={form.address} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn("text-xs transition-colors", nameFilled ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                        {nameFilled ? "✓ Listo para guardar" : "Completa el nombre para continuar"}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Guardando...
                                </span>
                            ) : branch ? "Guardar cambios" : "Crear sucursal"}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}