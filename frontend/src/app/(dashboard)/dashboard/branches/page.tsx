"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Search, Building2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { BranchDialog } from "@/features/branches/branch-dialog"

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<Branch | null>(null)

    async function load() {
        try {
            const data = await branchesApi.list()
            setBranches(data)
        } catch {
            sileo.error({ title: "Error al cargar sucursales" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setSelected(null)
        setDialogOpen(true)
    }

    function openEdit(branch: Branch) {
        setSelected(branch)
        setDialogOpen(true)
    }

    async function handleDeactivate(branch: Branch) {
        try {
            await branchesApi.deactivate(branch.id)
            sileo.success({ title: `"${branch.name}" desactivada` })
            load()
        } catch {
            sileo.error({ title: "Error al desactivar sucursal" })
        }
    }

    const filtered = branches.filter(
        (b) =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.code.toLowerCase().includes(search.toLowerCase()) ||
            b.address?.toLowerCase().includes(search.toLowerCase())
    )

    const activeCount = branches.filter((b) => b.is_active).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Sucursales</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {activeCount} sucursal{activeCount !== 1 ? "es" : ""} activa{activeCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={openCreate} size="sm">
                    <Plus size={16} className="mr-2" />
                    Nueva sucursal
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, código o dirección..."
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
                            {["Sucursal", "Código", "Teléfono", "Dirección", "Estado", "Creada", ""].map((h) => (
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
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    Cargando...
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 size={32} className="text-muted-foreground/40" />
                                        {search ? "Sin resultados para tu búsqueda" : "No hay sucursales registradas"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filtered.map((branch) => (
                            <tr key={branch.id} className="border-t hover:bg-muted/30 transition-colors">
                                {/* Sucursal */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 size={14} className="text-primary" />
                                        </div>
                                        <span className="font-medium">{branch.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {branch.code}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {branch.phone ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                                    {branch.address ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={branch.is_active ? "default" : "secondary"}>
                                        {branch.is_active ? "Activa" : "Inactiva"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(branch.created_at)}
                                </td>
                                {/* Acciones */}
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                        >
                                            <MoreHorizontal size={16} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(branch)}>
                                                Editar
                                            </DropdownMenuItem>
                                            {branch.is_active && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeactivate(branch)}
                                                        variant="destructive"
                                                    >
                                                        Desactivar
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <BranchDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                branch={selected}
                onSuccess={() => { setDialogOpen(false); load() }}
            />
        </div>
    )
}