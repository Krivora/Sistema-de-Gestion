import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PAYMENT_METHODS } from "@/lib/api/sales"
import type { Branch } from "@/lib/api/branches"

interface Props {
    branches: Branch[]
    branchId: string
    paymentMethod: string
    docNo: string
    disableBranch: boolean
    paymentType?: "contado" | "credito"
    /** Ausente en modo edición: el tipo no se cambia después de creada */
    onPaymentTypeChange?: (v: "contado" | "credito") => void
    onBranchChange: (v: string | null) => void
    onPaymentChange: (v: string | null) => void
    onDocNoChange: (v: string) => void
}

export function SaleDetailsPanel({
    branches,
    branchId,
    paymentMethod,
    docNo,
    disableBranch,
    paymentType = "contado",
    onPaymentTypeChange,
    onBranchChange,
    onPaymentChange,
    onDocNoChange,
}: Props) {
    // Obtener el nombre de la sucursal seleccionada
    const selectedBranchName = useMemo(() => {
        return (
            branches.find((b) => String(b.id) === branchId)?.name ??
            "Selecciona sucursal"
        )
    }, [branches, branchId])

    // Obtener la etiqueta del método de pago seleccionado
    const selectedPaymentLabel = useMemo(() => {
        return (
            PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ??
            "Selecciona método de pago"
        )
    }, [paymentMethod])

    return (
        <div className="border rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Detalles
            </h2>

            {/* Row: Sucursal y Método de Pago */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Sucursal */}
                <div className="space-y-1.5">
                    <Label>
                        Sucursal <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={branchId}
                        onValueChange={onBranchChange}
                        disabled={disableBranch}
                    >
                        <SelectTrigger className="w-full md:w-55">
                            <SelectValue
                                placeholder="Selecciona sucursal"
                                className="truncate"
                            >
                                {selectedBranchName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-55">
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                    <span className="truncate block">{b.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Método de Pago */}
                <div className="space-y-1.5">
                    <Label>Método de pago</Label>
                    <Select value={paymentMethod} onValueChange={onPaymentChange}>
                        <SelectTrigger className="w-full md:w-35">
                            <SelectValue
                                placeholder="Selecciona método de pago"
                                className="truncate"
                            >
                                {selectedPaymentLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-35">
                            {PAYMENT_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tipo de venta — solo al crear */}
            {onPaymentTypeChange && (
                <div className="space-y-1.5">
                    <Label>Tipo de venta</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {([
                            { value: "contado", label: "Contado", hint: "Se paga completa" },
                            { value: "credito", label: "A abonos", hint: "Paga en partes" },
                        ] as const).map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onPaymentTypeChange(opt.value)}
                                aria-pressed={paymentType === opt.value}
                                className={
                                    "rounded-lg border px-3 py-2 text-left transition-colors " +
                                    (paymentType === opt.value
                                        ? "border-primary bg-primary/5"
                                        : "hover:bg-muted/50")
                                }
                            >
                                <span className="block text-sm font-medium">{opt.label}</span>
                                <span className="block text-[11px] text-muted-foreground">{opt.hint}</span>
                            </button>
                        ))}
                    </div>
                    {paymentType === "credito" && (
                        <p className="text-[11px] text-muted-foreground">
                            El inventario se descuenta al registrar la venta. No podrás
                            publicarla hasta que quede saldada.
                        </p>
                    )}
                </div>
            )}

            {/* No. de Documento */}
            <div className="space-y-1.5">
                <Label htmlFor="doc_no">
                    No. de documento{" "}
                    <span className="ml-1 text-xs text-muted-foreground">
                        (opcional)
                    </span>
                </Label>
                <Input
                    id="doc_no"
                    placeholder="Ej. OPC-001"
                    value={docNo}
                    onChange={(e) => onDocNoChange(e.target.value)}
                />
            </div>
        </div>
    )
}