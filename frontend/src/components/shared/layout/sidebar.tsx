"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard, Package, ShoppingCart, LogOut,
    ChevronLeft, ChevronRight, Users, Building2, Truck, ArrowLeftRight,
    SlidersHorizontal, Tag, UserCircle, ClipboardList, X, HandCoins
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useUIStore } from "@/store/ui.store"
import { useRole } from "@/hooks/use-role"
import { useAbility } from "@/hooks/use-ability"

interface NavItem {
    href: string
    label: string
    icon: React.ElementType
    exact?: boolean
    permission?: string
    roles?: string[]
}
interface NavGroup {
    label: string
    roles: string[]
    items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: "General",
        roles: ["admin", "user"],
        items: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
        ],
    },
    {
        label: "Inventario",
        roles: ["admin", "user"],
        items: [
            { href: "/dashboard/categories", label: "Categorías", icon: Tag, permission: "categories.read" },
            { href: "/dashboard/products", label: "Productos", icon: Package, permission: "products.read" },
            { href: "/dashboard/branch-products", label: "Stock por Sucursal", icon: Building2, permission: "products.read" },
        ],
    },
    {
        label: "Operaciones",
        roles: ["admin", "user"],
        items: [
            { href: "/dashboard/sales", label: "Ventas", icon: ShoppingCart, permission: "sales.read" },
            { href: "/dashboard/receivables", label: "Por Cobrar", icon: HandCoins, permission: "sales.read" },
            { href: "/dashboard/purchases", label: "Compras", icon: Truck, permission: "purchases.read" },
            { href: "/dashboard/adjustments", label: "Ajustes", icon: SlidersHorizontal, permission: "adjustments.read" },
            { href: "/dashboard/transfers", label: "Transferencias", icon: ArrowLeftRight, permission: "transfers.read" },
        ],
    },
    {
        label: "Relaciones",
        roles: ["admin", "user"],
        items: [
            { href: "/dashboard/customers", label: "Clientes", icon: UserCircle, permission: "customers.read" },
            { href: "/dashboard/suppliers", label: "Proveedores", icon: Truck, permission: "suppliers.read" },
        ],
    },
    {
        label: "Administración",
        roles: ["admin"],
        items: [
            { href: "/dashboard/users", label: "Usuarios", icon: Users },
            { href: "/dashboard/branches", label: "Sucursales", icon: Building2 },
        ],
    },
    {
        label: "Sistema",
        roles: ["superadmin"],
        items: [
            { href: "/dashboard/clients", label: "Clientes", icon: Building2 },
            { href: "/dashboard/activities", label: "Actividad", icon: ClipboardList },
            { href: "/dashboard/roles", label: "Roles", icon: Users },
        ],
    },
]

function isActive(pathname: string, href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
}

function SidebarContent({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
    const { role } = useRole()
    const ability = useAbility()
    const pathname = usePathname()
    const logout = useAuthStore((s) => s.logout)
    const user = useAuthStore((s) => s.user)
    const router = useRouter()
    const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "U"

    const visibleGroups = NAV_GROUPS
        .filter((g) => g.roles.includes(role ?? ""))
        .map((g) => ({
            ...g,
            items: g.items.filter((item) => {
                if ("roles" in item && item.roles) return item.roles.includes(role ?? "")
                if (item.permission) {
                    const [subject, action] = item.permission.split(".")
                    return ability.can(action, subject)
                }
                return true
            }),
        }))
        .filter((g) => g.items.length > 0)

    function handleLogout() {
        logout()
        router.push("/login")
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className={cn(
                "h-14 border-b flex items-center gap-3 px-4 shrink-0",
                collapsed && "justify-center px-2"
            )}>
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate leading-tight">
                            {user?.business_name ?? "Inventory"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Cerrar menú"
                        className="ml-auto p-1.5 rounded-md hover:bg-muted transition-colors min-w-8 min-h-8 flex items-center justify-center"
                    >
                        <X size={16} aria-hidden />
                    </button>
                )}
            </div>

            <Separator />

            {/* Nav */}
            <nav
                aria-label="Navegación principal"
                className="flex-1 overflow-y-auto py-3 px-2 space-y-4"
                style={{ scrollbarWidth: "thin" }}
            >
                {visibleGroups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map(({ href, label, icon: Icon, exact }) => {
                                const active = isActive(pathname, href, exact)
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-label={collapsed ? label : undefined}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                            "min-h-10", // touch target
                                            collapsed && "justify-center px-0",
                                            active
                                                ? "bg-primary/10 text-primary dark:bg-primary/20"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon
                                            size={17}
                                            aria-hidden
                                            className={cn(
                                                "shrink-0 transition-colors",
                                                active ? "text-primary" : "text-muted-foreground"
                                            )}
                                        />
                                        {!collapsed && (
                                            <>
                                                <span className="truncate flex-1">{label}</span>
                                                {active && (
                                                    <span
                                                        aria-hidden
                                                        className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <Separator />

            {/* Footer */}
            <div className="p-2 shrink-0">
                <button
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                    className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-10",
                        "text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <LogOut size={16} aria-hidden className="shrink-0" />
                    {!collapsed && <span>Cerrar sesión</span>}
                </button>
            </div>
        </div>
    )
}

export function Sidebar() {
    const collapsed = useUIStore((s) => s.sidebarCollapsed)
    const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
    const mobileOpen = useUIStore((s) => s.mobileOpen)
    const setMobileOpen = useUIStore((s) => s.setMobileOpen)

    return (
        <>
            {/* Desktop */}
            <aside
                className={cn(
                    "hidden md:flex fixed top-0 left-0 z-40 h-screen flex-col border-r bg-card",
                    "transition-[width] duration-300 ease-in-out",
                    collapsed ? "w-14" : "w-60"
                )}
                aria-label="Sidebar"
            >
                <SidebarContent collapsed={collapsed} />
                <button
                    onClick={() => setSidebarCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                    className="absolute -right-3 top-18 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
                >
                    {collapsed
                        ? <ChevronRight size={12} aria-hidden />
                        : <ChevronLeft size={12} aria-hidden />
                    }
                </button>
            </aside>

            {/* Mobile overlay + drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-[2px]"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                    <aside
                        className="fixed left-0 top-0 z-50 h-full w-70 bg-card border-r shadow-2xl md:hidden flex flex-col"
                        aria-label="Menú de navegación"
                    >
                        <SidebarContent onClose={() => setMobileOpen(false)} />
                    </aside>
                </>
            )}
        </>
    )
}