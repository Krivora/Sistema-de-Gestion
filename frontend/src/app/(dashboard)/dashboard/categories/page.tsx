"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Tag } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { CategoryDialog } from "@/features/categories/category-dialog"

const STATUS_LABEL: Record<Category["status"], string> = {
    active: "Activo",
    inactive: "Inactivo",
    deleted: "Eliminado",
}

const STATUS_VARIANT: Record<Category["status"], "default" | "secondary" | "destructive"> = {
    active: "default",
    inactive: "secondary",
    deleted: "destructive",
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<Category | null>(null)

    async function load() {
        try {
            const data = await categoriesApi.list()
            setCategories(data)
        } catch {
            sileo.error({ title: "Error al cargar categorías" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setSelected(null)
        setDialogOpen(true)
    }

    function openEdit(cat: Category) {
        setSelected(cat)
        setDialogOpen(true)
    }

    async function handleActivate(cat: Category) {
        try {
            await categoriesApi.activate(cat.id)
            sileo.success({ title: `"${cat.name}" activada` })
            load()
        } catch {
            sileo.error({ title: "Error al activar categoría" })
        }
    }

    async function handleDeactivate(cat: Category) {
        try {
            await categoriesApi.deactivate(cat.id)
            sileo.success({ title: `"${cat.name}" desactivada` })
            load()
        } catch {
            sileo.error({ title: "Error al desactivar categoría" })
        }
    }

    async function handleDelete(cat: Category) {
        try {
            await categoriesApi.delete(cat.id)
            sileo.success({ title: `"${cat.name}" eliminada` })
            load()
        } catch {
            sileo.error({ title: "Error al eliminar categoría" })
        }
    }

    const filtered = categories.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.description?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Categorías</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {categories.filter((c) => c.status === "active").length} activa
                        {categories.filter((c) => c.status === "active").length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={openCreate} size="sm">
                    <Plus size={16} className="mr-2" />
                    Nueva categoría
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Tabla */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Categoría", "Código", "Descripción", "Estado", "Creada", ""].map((h) => (
                                <th
                                    key={h}
                                    className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    Cargando...
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Tag size={32} className="text-muted-foreground/40" />
                                        {search ? "Sin resultados para tu búsqueda" : "No hay categorías registradas"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filtered.map((cat) => (
                            <tr
                                key={cat.id}
                                className="border-t hover:bg-muted/30 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                            <Tag size={14} className="text-primary" />
                                        </div>
                                        <span className="font-medium">{cat.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {cat.code}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground max-w-[240px] truncate">
                                    {cat.description ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANT[cat.status]}>
                                        {STATUS_LABEL[cat.status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(cat.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                        >
                                            <MoreHorizontal size={16} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(cat)}>
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {cat.status === "active" ? (
                                                <DropdownMenuItem onClick={() => handleDeactivate(cat)}>
                                                    Desactivar
                                                </DropdownMenuItem>
                                            ) : cat.status === "inactive" ? (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleActivate(cat)}>
                                                        Activar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(cat)}
                                                        variant="destructive"
                                                    >
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </>
                                            ) : null}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CategoryDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                category={selected}
                onSuccess={() => { setDialogOpen(false); load() }}
            />
        </div>
    )
}