import { apiClient } from "./client"

/** 'fixed' trae siempre el mismo surtido; 'flexible' lo arma el vendedor. */
export type PackageKind = "fixed" | "flexible"

/** De dónde pueden salir las piezas de un paquete armable. */
export type SelectionScope = "any" | "category" | "list"

export interface PackageItem {
    id: number
    product_id: number
    /** Piezas por paquete. En un paquete armable la lista solo restringe, y va en 1. */
    qty: number
    product_name: string
    sku: string
    product_status: "active" | "inactive" | "deleted"
}

export interface Package {
    id: number
    code: string
    name: string
    description: string | null
    kind: PackageKind
    /** Precio de todo el paquete. Se reparte entre sus productos al venderlo. */
    price: number
    /** Solo armables: cuántas piezas debe llevar */
    item_count: number | null
    selection_scope: SelectionScope
    category_id: number | null
    category_name: string | null
    status: "active" | "inactive" | "deleted"
    created_at: string
    updated_at: string
    client_name?: string
    items: PackageItem[]
}

export interface PackageItemDto {
    product_id: number
    qty?: number
}

export interface CreatePackageDto {
    name: string
    description?: string
    kind: PackageKind
    price: number
    item_count?: number | null
    selection_scope?: SelectionScope
    category_id?: number | null
    items: PackageItemDto[]
    code?: string
}

export type UpdatePackageDto = CreatePackageDto

export const PACKAGE_KINDS: { value: PackageKind; label: string; hint: string }[] = [
    { value: "fixed", label: "Predefinido", hint: "Siempre lleva los mismos productos" },
    { value: "flexible", label: "Armable", hint: "El vendedor elige las piezas al vender" },
]

export const SELECTION_SCOPES: { value: SelectionScope; label: string; hint: string }[] = [
    { value: "any", label: "Cualquier producto", hint: "Sin restricción de contenido" },
    { value: "category", label: "De una categoría", hint: "Solo productos de la categoría elegida" },
    { value: "list", label: "De una lista", hint: "Solo los productos que elijas" },
]

/** Piezas que lleva el paquete: definidas en armables, sumadas en predefinidos. */
export function packageUnitCount(pkg: Package): number {
    if (pkg.kind === "flexible") return Number(pkg.item_count ?? 0)
    return pkg.items.reduce((acc, i) => acc + Number(i.qty), 0)
}

export const packagesApi = {
    list: () => apiClient.get<Package[]>("/packages").then((r) => r.data),
    get: (id: number) => apiClient.get<Package>(`/packages/${id}`).then((r) => r.data),
    create: (data: CreatePackageDto) =>
        apiClient.post<Package>("/packages", data).then((r) => r.data),
    update: (id: number, data: UpdatePackageDto) =>
        apiClient.put<Package>(`/packages/${id}`, data).then((r) => r.data),
    activate: (id: number) => apiClient.patch(`/packages/${id}/activate`).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/packages/${id}/deactivate`).then((r) => r.data),
    delete: (id: number) => apiClient.patch(`/packages/${id}/delete`).then((r) => r.data),
}
