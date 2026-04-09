"use client"
import { useEffect, useState } from "react"
import { clientsApi, type Client } from "@/lib/api/clients"
import { sileo } from "sileo"
import { Can } from "@/components/shared/can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { ClientDialog, LogoDialog } from "@/features/clients"

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [logoDialogOpen, setLogoDialogOpen] = useState(false)
    const [selected, setSelected] = useState<Client | null>(null)

    async function load() {
        try {
            const data = await clientsApi.list()
            setClients(data)
        } catch {
            sileo.error({ title: "Error al cargar clientes" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    async function handleToggle(client: Client) {
        try {
            await clientsApi.deactivate(client.id)
            sileo.success({ title: `Cliente ${client.is_active ? "desactivado" : "activado"}` })
            load()
        } catch {
            sileo.error({ title: "Error al cambiar estado" })
        }
    }

    function openEdit(client: Client) {
        setSelected(client)
        setDialogOpen(true)
    }

    function openLogo(client: Client) {
        setSelected(client)
        setLogoDialogOpen(true)
    }

    function openCreate() {
        setSelected(null)
        setDialogOpen(true)
    }

    const filtered = clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado{clients.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Can role="superadmin">
                    <Button onClick={openCreate} size="sm">
                        <Plus size={16} className="mr-2" />
                        Nuevo cliente
                    </Button>
                </Can>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, código o email..."
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
                            {["Cliente", "Código", "Email", "Usuarios", "Sucursales", "Estado", "Creado", ""].map((h) => (
                                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                    Cargando...
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                    {search ? "Sin resultados para tu búsqueda" : "No hay clientes registrados"}
                                </td>
                            </tr>
                        )}
                        {filtered.map((client) => (
                            <tr key={client.id} className="border-t hover:bg-muted/30 transition-colors">
                                {/* Cliente */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            {client.logo_url && <AvatarImage src={client.logo_url} alt={client.name} />}
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                                {client.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{client.name}</p>
                                            {client.business_name && (
                                                <p className="text-xs text-muted-foreground truncate">{client.business_name}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{client.code}</td>
                                <td className="px-4 py-3 text-muted-foreground">{client.email ?? "—"}</td>
                                <td className="px-4 py-3 text-center">{client.max_users}</td>
                                <td className="px-4 py-3 text-center">{client.max_branches}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={client.is_active ? "default" : "secondary"}>
                                        {client.is_active ? "Activo" : "Inactivo"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(client.created_at)}
                                </td>
                                {/* Acciones */}
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors">
                                            <MoreHorizontal size={16} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(client)}>
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openLogo(client)}>
                                                Cambiar logo
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggle(client)}
                                                className={client.is_active ? "text-destructive focus:text-destructive" : ""}
                                            >
                                                {client.is_active ? "Desactivar" : "Activar"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dialogs */}
            <ClientDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                client={selected}
                onSuccess={() => { setDialogOpen(false); load() }}
            />
            <LogoDialog
                open={logoDialogOpen}
                onClose={() => setLogoDialogOpen(false)}
                client={selected}
                onSuccess={() => { setLogoDialogOpen(false); load() }}
            />
        </div>
    )
}