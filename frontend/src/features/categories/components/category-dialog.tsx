"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { categoriesApi, type Category, type CreateCategoryDto } from "@/lib/api/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Props {
    open: boolean
    onClose: () => void
    category: Category | null
    onSuccess: () => void
}

const EMPTY: CreateCategoryDto = { name: "", description: "", code: "" }

function CategoryForm({
    form,
    category,
    loading,
    nameError,
    optionalOpen,
    onChangeInput,
    onToggleOptional,
    onSubmit,
    onClose,
}: {
    form: CreateCategoryDto
    category: Category | null
    loading: boolean
    nameError: string
    optionalOpen: boolean
    onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void
    onToggleOptional: () => void
    onSubmit: () => void
    onClose: () => void
}) {
    const nameFilled = !!form.name.trim()

    return (
        <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b">
                <div className="space-y-1">
                    <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                        category
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    )}>
                        {category ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        )}
                        {category ? "Editar categoría" : "Nueva categoría"}
                    </span>
                    <p className="text-base font-medium leading-snug text-foreground">
                        {category ? `Editando: ${category.name}` : "¿Cómo se llama la categoría?"}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-border relative">
                <div
                    className="h-full transition-all duration-300 rounded-r-full"
                    style={{ width: nameFilled ? "100%" : "0%", background: nameFilled ? "rgb(16 185 129)" : "transparent" }}
                />
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                        Nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        name="name"
                        placeholder="Ej. Electrónica"
                        value={form.name}
                        onChange={onChangeInput}
                        autoFocus
                        className={cn("text-[15px] h-10", nameError && "border-destructive focus-visible:ring-destructive")}
                    />
                    {nameError && (
                        <p className="text-[11px] text-destructive flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {nameError}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onToggleOptional}
                    className="w-full flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                    <span className="flex-1 h-px bg-border" />
                    Campos opcionales
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform duration-200", optionalOpen && "rotate-180")}>
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                    <span className="flex-1 h-px bg-border" />
                </button>

                <div className={cn(
                    "grid gap-4 overflow-hidden transition-all duration-200",
                    !category ? "grid-cols-2" : "grid-cols-1",
                    optionalOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                    <div className="overflow-hidden space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Descripción</Label>
                        <Input name="description" placeholder="Descripción breve..." value={form.description} onChange={onChangeInput} />
                    </div>
                    {!category && (
                        <div className="overflow-hidden space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Código</Label>
                            <Input name="code" placeholder="ELEC-001" value={form.code} onChange={onChangeInput} className="font-mono text-sm" />
                            <p className="text-[11px] text-muted-foreground">Se autogenera si vacío</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                <p className={cn("text-xs transition-colors", nameFilled ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                    {nameFilled ? "✓ Listo para guardar" : "Completa el nombre para continuar"}
                </p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button size="sm" onClick={onSubmit} disabled={loading} className="min-w-30">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Guardando...
                            </span>
                        ) : category ? "Guardar cambios" : "Crear categoría"}
                    </Button>
                </div>
            </div>
        </>
    )
}

export function CategoryDialog({ open, onClose, category, onSuccess }: Props) {
    const [form, setForm] = useState<CreateCategoryDto>(EMPTY)
    const [loading, setLoading] = useState(false)
    const [nameError, setNameError] = useState("")
    const [optionalOpen, setOptionalOpen] = useState(false)
    const isMobile = useMediaQuery("(max-width: 639px)")

    useEffect(() => {
        if (open) {
            setNameError("")
            setOptionalOpen(false)
            setForm(category
                ? { name: category.name, description: category.description ?? "", code: category.code }
                : EMPTY
            )
        }
    }, [open, category])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (name === "name" && nameError) setNameError("")
    }

    async function handleSubmit() {
        if (!form.name.trim()) { setNameError("El nombre es requerido"); return }
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

    const formProps = {
        form, category, loading, nameError, optionalOpen,
        onChangeInput: handleChange,
        onToggleOptional: () => setOptionalOpen((p) => !p),
        onSubmit: handleSubmit,
        onClose,
    }

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
                <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl max-h-[92dvh] flex flex-col">
                    <SheetTitle className="sr-only">{category ? "Editar categoría" : "Nueva categoría"}</SheetTitle>
                    <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
                    <CategoryForm {...formProps} />
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-115 p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogTitle className="sr-only">{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
                <CategoryForm {...formProps} />
            </DialogContent>
        </Dialog>
    )
}