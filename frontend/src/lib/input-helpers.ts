// Filtra solo dígitos — para teléfonos, cantidades, etc.
export function onlyDigits(value: string) {
    return value.replace(/\D/g, "")
}

// Filtra solo números con decimales — para precios, costos, etc.
export function onlyDecimals(value: string) {
    return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
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