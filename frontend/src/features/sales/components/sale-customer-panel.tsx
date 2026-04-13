import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { onlyDigits } from "@/lib/input-helpers"
import type { Customer } from "@/lib/api/customers"

interface Props {
    customerSearchRef: React.RefObject<HTMLDivElement>
    customerId: string
    customerName: string
    customerPhone: string
    customerSearch: string
    customerSearchOpen: boolean
    filteredCustomers: Customer[]
    onSearchChange: (v: string) => void
    onSearchOpenChange: (v: boolean) => void
    onSelectCustomer: (c: Customer) => void
    onClear: () => void
    onNameChange: (v: string) => void
    onPhoneChange: (v: string) => void
}

export function SaleCustomerPanel({
    customerSearchRef, customerId, customerName, customerPhone,
    customerSearch, customerSearchOpen, filteredCustomers,
    onSearchChange, onSearchOpenChange, onSelectCustomer, onClear, onNameChange, onPhoneChange,
}: Props) {
    return (
        <div className="border rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Cliente <span className="ml-1 normal-case font-normal text-muted-foreground/60">(opcional)</span>
            </h2>
            <div ref={customerSearchRef} className="relative">
                <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={customerSearch}
                        onChange={(e) => { onSearchChange(e.target.value); onSearchOpenChange(true); if (!e.target.value) onClear() }}
                        onFocus={() => onSearchOpenChange(true)}
                        className="pl-9"
                    />
                    {customerId && (
                        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">✕</button>
                    )}
                </div>
                {customerSearchOpen && filteredCustomers.length > 0 && !customerId && (
                    <div className="max-h-52 overflow-y-auto">
                        <div className="max-h-50 overflow-y-auto">
                            {filteredCustomers.map((c) => (
                                <button key={c.id} onClick={() => onSelectCustomer(c)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left">
                                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                                        {c.name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                        {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {!customerId && (
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="customer_name">Nombre</Label>
                        <Input
                            id="customer_name"
                            placeholder="Nombre del cliente"
                            value={customerName}
                            onFocus={() => onSearchOpenChange(false)}
                            onChange={(e) => onNameChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="customer_phone">Teléfono</Label>
                        <Input
                            id="customer_phone"
                            placeholder="Teléfono"
                            value={customerPhone}
                            onFocus={() => onSearchOpenChange(false)}
                            onChange={(e) => onPhoneChange(onlyDigits(e.target.value))}
                            inputMode="numeric"
                        />
                    </div>
                </div>
            )}
            {customerId && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                        {customerName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{customerName}</p>
                        {customerPhone && <p className="text-xs text-muted-foreground">{customerPhone}</p>}
                    </div>
                    <Badge variant="secondary" className="text-xs">Registrado</Badge>
                </div>
            )}
        </div>
    )
}