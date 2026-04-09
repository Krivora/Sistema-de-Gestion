"use client"
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Productos",
    categories: "Categorías",
    "branch-products": "Stock por Sucursal",
    sales: "Ventas",
    purchases: "Compras",
    adjustments: "Ajustes",
    transfers: "Transferencias",
    customers: "Clientes",
    suppliers: "Proveedores",
    reports: "Reportes",
    activities: "Actividad",
    users: "Usuarios",
    branches: "Sucursales",
    settings: "Configuración",
}

export function Breadcrumbs() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length <= 1) return null

    const crumbs = segments.map((seg, i) => ({
        href: "/" + segments.slice(0, i + 1).join("/"),
        label: LABELS[seg] ?? seg,
        isLast: i === segments.length - 1,
    }))

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
                </BreadcrumbItem>
                {crumbs.flatMap(({ href, label, isLast }) => [
                    <BreadcrumbSeparator key={`sep-${href}`} />,
                    <BreadcrumbItem key={href}>
                        {isLast ? (
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                        )}
                    </BreadcrumbItem>,
                ])}
            </BreadcrumbList>
        </Breadcrumb>
    )
}