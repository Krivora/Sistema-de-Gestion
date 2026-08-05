"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertOctagon, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { apiClient } from "@/lib/api/client"
import { formatDate } from "@/lib/utils"

interface Billing {
    pending_cycles?: number
    oldest_unpaid_due?: string | null
    for_nonpayment?: boolean
}

export default function SuspendedPage() {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)
    const [billing, setBilling] = useState<Billing | null>(null)
    const [checking, setChecking] = useState(false)

    // El detalle del adeudo lo devuelve el propio 402 de cualquier endpoint
    useEffect(() => {
        const stored = sessionStorage.getItem("billing_block")
        if (stored) {
            try { setBilling(JSON.parse(stored)) } catch { /* dato viejo, se ignora */ }
        }
    }, [])

    /** Vuelve a intentar: si ya se registró el pago, el API deja pasar. */
    async function recheck() {
        setChecking(true)
        try {
            await apiClient.get("/branches")
            sessionStorage.removeItem("billing_block")
            router.push("/dashboard")
        } catch {
            // sigue suspendida; el interceptor ya actualizó el detalle
            const stored = sessionStorage.getItem("billing_block")
            if (stored) {
                try { setBilling(JSON.parse(stored)) } catch { /* ignore */ }
            }
        } finally {
            setChecking(false)
        }
    }

    function handleLogout() {
        sessionStorage.removeItem("billing_block")
        logout()
        router.push("/login")
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md border rounded-xl p-6 space-y-5 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertOctagon className="text-destructive" size={26} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">Cuenta suspendida</h1>
                    <p className="text-sm text-muted-foreground">
                        Para continuar usando el sistema, realiza el pago pendiente.
                        En cuanto se registre, tu acceso se restablece automáticamente.
                    </p>
                </div>

                {billing?.pending_cycles ? (
                    <div className="rounded-lg bg-muted/50 border p-3 text-sm space-y-1">
                        <p>
                            <strong>{billing.pending_cycles}</strong> corte
                            {billing.pending_cycles !== 1 ? "s" : ""} sin pagar
                        </p>
                        {billing.oldest_unpaid_due && (
                            <p className="text-xs text-muted-foreground">
                                El más antiguo venció el {formatDate(billing.oldest_unpaid_due)}
                            </p>
                        )}
                    </div>
                ) : null}

                {user?.business_name && (
                    <p className="text-xs text-muted-foreground">{user.business_name}</p>
                )}

                <div className="flex flex-col gap-2">
                    <Button onClick={recheck} disabled={checking}>
                        <RefreshCw size={15} className={`mr-2 ${checking ? "animate-spin" : ""}`} />
                        {checking ? "Verificando..." : "Ya pagué, verificar"}
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut size={15} className="mr-2" />
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </div>
    )
}
