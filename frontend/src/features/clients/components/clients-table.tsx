import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Client } from "@/lib/api/clients"

interface ClientsTableProps {
    clients: Client[]
    loading: boolean
    hasActiveFilters: boolean
    onEdit: (c: Client) => void
    onLogo: (c: Client) => void
    onToggle: (c: Client) => void
}

const columns = (
    onEdit: (c: Client) => void,
    onLogo: (c: Client) => void,
    onToggle: (c: Client) => void,
): ColumnDef<Client>[] => [
        {
            key: "name", header: "Cliente", width: "25%",
            cell: (c) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                        {c.logo_url && <AvatarImage src={c.logo_url} alt={c.name} />}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                            {c.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        {c.business_name && (
                            <p className="text-xs text-muted-foreground truncate">{c.business_name}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "code", header: "Código", width: 110,
            cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.code}</span>,
        },
        {
            key: "email", header: "Email", width: "22%",
            cell: (c) => <span className="text-muted-foreground truncate block">{c.email ?? "—"}</span>,
        },
        {
            key: "max_users", header: "Usuarios", width: 90,
            cell: (c) => <span className="text-center block">{c.max_users}</span>,
        },
        {
            key: "max_branches", header: "Sucursales", width: 100,
            cell: (c) => <span className="text-center block">{c.max_branches}</span>,
        },
        {
            key: "status", header: "Estado", width: 100,
            cell: (c) => (
                <Badge variant={c.is_active ? "default" : "secondary"}>
                    {c.is_active ? "Activo" : "Inactivo"}
                </Badge>
            ),
        },
        {
            key: "created_at", header: "Creado", width: 120,
            cell: (c) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(c.created_at)}</span>,
        },
        {
            key: "actions", header: "", width: 48,
            cell: (c) => (
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors">
                        <MoreHorizontal size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(c)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onLogo(c)}>Cambiar logo</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onToggle(c)}
                            className={c.is_active ? "text-destructive focus:text-destructive" : ""}
                        >
                            {c.is_active ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

export function ClientsTable({ clients, loading, hasActiveFilters, onEdit, onLogo, onToggle }: ClientsTableProps) {
    return (
        <DataTable
            columns={columns(onEdit, onLogo, onToggle)}
            data={clients}
            loading={loading}
            rowKey={(c) => c.id}
            emptyIcon={<Users size={32} className="text-muted-foreground/40" />}
            emptyText="No hay clientes registrados"
            emptyFilterText="Sin resultados para tu búsqueda"
            hasActiveFilters={hasActiveFilters}
        />
    )
}