// Filtra solo dígitos — para teléfonos, cantidades, etc.
export function onlyDigits(value: string) {
    return value.replace(/\D/g, "")
}

// Filtra solo números con decimales — para precios, costos, etc.
export function onlyDecimals(value: string) {
    return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
}

// Normaliza un número del API a texto limpio para un input.
// Postgres devuelve numeric como texto: "1.0000" -> "1", "18000.00" -> "18000"
export function toInputNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === "") return ""
    const n = Number(value)
    return Number.isFinite(n) ? String(n) : ""
}

// Formatea para lectura: "18000.5" -> "18,000.50". Devuelve el texto tal cual
// si aún no es un número válido (p. ej. mientras se escribe "18000.")
export function formatMoneyInput(value: string): string {
    if (!value) return ""
    const n = Number(value)
    if (!Number.isFinite(n)) return value
    return n.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

// Quita la máscara: "18,000.50" -> "18000.50"
export function unmaskMoney(value: string): string {
    return value.replace(/,/g, "")
}

// Valida formato de email básico
export function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

// Extrae mensaje de error de axios
export function getApiError(err: unknown, fallback = "Error inesperado"): string {
    if (err && typeof err === "object" && "response" in err) {
        return (err as any).response?.data?.error ?? fallback
    }
    return fallback
}