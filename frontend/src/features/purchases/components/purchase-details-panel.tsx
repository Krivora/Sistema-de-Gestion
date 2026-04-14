import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Branch } from "@/lib/api/branches"
import type { Supplier } from "@/lib/api/suppliers"

interface Props {
    branches: Branch[]
    suppliers: Supplier[]
    branchId: string
    supplierId: string
    docNo: string
    selectedBranch?: Branch
    selectedSupplier?: Supplier
    disableBranch: boolean
    onBranchChange: (v: string | null) => void
    onSupplierChange: (v: string | null) => void
    onDocNoChange: (v: string) => void
}

export function PurchaseDetailsPanel({
    branches, suppliers, branchId, supplierId, docNo,
    selectedBranch, selectedSupplier, disableBranch,
    onBranchChange, onSupplierChange, onDocNoChange,
}: Props) {
    return (
        <div className="border rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Detalles de la compra</h2>
            <div className="space-y-1.5">
                <Label>Sucursal <span className="text-destructive">*</span></Label>
                <Select value={branchId} onValueChange={onBranchChange} disabled={disableBranch}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona sucursal">
                            {selectedBranch ? <span className="block truncate">{selectedBranch.name}</span> : "Selecciona sucursal"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="md:w-[280px]">
                        {branches.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}><span className="block truncate">{b.name}</span></SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Proveedor <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                <Select value={supplierId} onValueChange={onSupplierChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin proveedor">
                            {supplierId ? <span className="block truncate">{selectedSupplier?.name}</span> : "Sin proveedor"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="md:w-[280px]">
                        <SelectItem value="">Sin proveedor</SelectItem>
                        {suppliers.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}><span className="block truncate">{s.name}</span></SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="doc_no">No. de documento <span className="text-xs text-muted-foreground ml-1">(opcional)</span></Label>
                <Input id="doc_no" placeholder="Ej. FAC-12345" value={docNo} onChange={(e) => onDocNoChange(e.target.value)} className="w-full" />
                <p className="text-xs text-muted-foreground">Se autogenera si no se especifica</p>
            </div>
        </div>
    )
}