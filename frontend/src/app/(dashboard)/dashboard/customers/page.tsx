"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { customersApi, type Customer } from "@/lib/api/customers"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Plus, Search, UserCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { CustomerDialog } from "@/features/customers/customer-dialog"

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<Customer | null>(null)

    async function load() {
        try {
            const data = await customersApi.list()
            setCustomers(data)
        } catch {
            sileo.error({ title: "Error al cargar clientes" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setSelected(null)
        setDialogOpen(true)
    }

    function openEdit(customer: Customer) {
        setSelected(customer)
        setDialogOpen(true)
    }

    async function handleDeactivate(customer: Customer) {
        try {
            await customersApi.deactivate(customer.id)
            sileo.success({ title: `"${customer.name}" desactivado` })
            load()
        } catch {
            sileo.error({ title: "Error al desactivar cliente" })
        }
    }

    const filtered = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
    )

    const activeCount = customers.filter((c) => c.is_active).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {activeCount} cliente{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={openCreate} size="sm">
                    <Plus size={16} className="mr-2" />
                    Nuevo cliente
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, email o teléfono..."
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
                            {["Cliente", "Teléfono", "Email", "Dirección", "Estado", "Registrado", ""].map((h) => (
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
                                        <UserCircle size={32} className="text-muted-foreground/40" />
                                        {search ? "Sin resultados para tu búsqueda" : "No hay clientes registrados"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filtered.map((customer) => (
                            <tr key={customer.id} className="border-t hover:bg-muted/30 transition-colors">
                                {/* Cliente */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                                {customer.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium truncate">{customer.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {customer.phone ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {customer.email ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                                    {customer.address ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={customer.is_active ? "default" : "secondary"}>
                                        {customer.is_active ? "Activo" : "Inactivo"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(customer.created_at)}
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
                                            <DropdownMenuItem onClick={() => openEdit(customer)}>
                                                Editar
                                            </DropdownMenuItem>
                                            {customer.is_active && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeactivate(customer)}
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

            <CustomerDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                customer={selected}
                onSuccess={() => { setDialogOpen(false); load() }}
            />
        </div>
    )
}