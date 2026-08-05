"use client"
import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, XCircle, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { apiClient } from "@/lib/api/client"
import type { AxiosError } from "axios"
import type { LoginResponse } from "@/types/api.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ── Constantes ────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

// ── Validaciones individuales ─────────────────────────────────────────────────
function validateEmail(email: string): string | null {
    if (!email.trim()) return "El correo es requerido"
    if (email.length > 254) return "Correo demasiado largo"
    if (!EMAIL_REGEX.test(email.trim())) return "Formato inválido (ej: usuario@empresa.com)"
    return null
}

function validatePassword(password: string): string | null {
    if (!password) return "La contraseña es requerida"
    if (password.length < 6) return "Mínimo 6 caracteres"
    if (password.length > 128) return "Contraseña demasiado larga"
    return null
}


// ── Tipos ─────────────────────────────────────────────────────────────────────
type FieldState = "idle" | "valid" | "error"

// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter()
    const setAuth = useAuthStore((s) => s.setAuth)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // Errores por campo + error general de API
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [apiError, setApiError] = useState("")

    // Estado visual por campo (para colorear borde)
    const [emailState, setEmailState] = useState<FieldState>("idle")
    const [passwordState, setPasswordState] = useState<FieldState>("idle")

    // Seguridad
    const attemptsRef = useRef(0)
    const lockedUntilRef = useRef<number | null>(null)
    const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS)
    const [lockCountdown, setLockCountdown] = useState(0)

    const emailRef = useRef<HTMLInputElement>(null)

    // Autofocus en email al montar
    useEffect(() => { emailRef.current?.focus() }, [])

    // Countdown del lockout
    useEffect(() => {
        if (lockCountdown <= 0) return
        const t = setInterval(() => {
            setLockCountdown((v) => {
                if (v <= 1) { clearInterval(t); return 0 }
                return v - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [lockCountdown])

    // Validación on-blur por campo
    const handleEmailBlur = useCallback(() => {
        if (!email) return // no validar si nunca tocó
        const err = validateEmail(email.trim().toLowerCase())
        setEmailError(err ?? "")
        setEmailState(err ? "error" : "valid")
    }, [email])

    const handlePasswordBlur = useCallback(() => {
        if (!password) return
        const err = validatePassword(password)
        setPasswordError(err ?? "")
        setPasswordState(err ? "error" : "valid")
    }, [password])

    const canSubmit = email.trim() !== "" && password !== "" && !loading && lockCountdown === 0

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        // Lockout check
        if (lockedUntilRef.current && Date.now() < lockedUntilRef.current) return

        // Validar todos los campos antes de enviar
        const sanitizedEmail = email.trim().toLowerCase()
        const eErr = validateEmail(sanitizedEmail)
        const pErr = validatePassword(password)

        if (eErr) { setEmailError(eErr); setEmailState("error") }
        if (pErr) { setPasswordError(pErr); setPasswordState("error") }
        if (eErr || pErr) return

        setLoading(true)
        setApiError("")

        try {
            const { data } = await apiClient.post<LoginResponse>("/auth/login", {
                email: sanitizedEmail,
                password,
            })
            attemptsRef.current = 0
            setAttemptsLeft(MAX_ATTEMPTS)
            setAuth(data.user, data.token, data.ability)

            // Entra igual, pero si la cuenta está suspendida va directo al aviso
            // de pago: el API le va a negar cualquier dato de todas formas.
            if (data.billing?.suspended) {
                sessionStorage.setItem("billing_block", JSON.stringify(data.billing))
                router.push("/suspended")
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            const status = (err as AxiosError)?.response?.status
            const serverMsg = (err as AxiosError<{ error?: string }>)?.response?.data?.error

            // Solo las credenciales malas cuentan para el bloqueo por intentos.
            // Un usuario desactivado puede reintentar mil veces sin que cambie
            // nada, y castigarlo por eso solo esconde el motivo real.
            if (status !== 401 && serverMsg) {
                setApiError(serverMsg)
                return
            }

            attemptsRef.current += 1
            const remaining = MAX_ATTEMPTS - attemptsRef.current

            if (attemptsRef.current >= MAX_ATTEMPTS) {
                lockedUntilRef.current = Date.now() + LOCKOUT_MS
                attemptsRef.current = 0
                setAttemptsLeft(MAX_ATTEMPTS)
                setLockCountdown(LOCKOUT_MS / 1000)
                setApiError("")
            } else {
                setAttemptsLeft(remaining)
                setApiError("Correo o contraseña incorrectos.")
            }
        } finally {
            setLoading(false)
        }
    }, [email, password, setAuth, router])

    // En la función fieldBorderClass, quita el caso "valid":
    const fieldBorderClass = (state: FieldState) => cn(
        "bg-white/60 text-[#1c1b1b] text-base h-12 transition-all duration-200",
        state === "idle" && "border-[#5a5959] focus-visible:ring-[#4207c0] focus-visible:border-[#4207c0]",
        state === "valid" && "border-[#5a5959] focus-visible:ring-[#4207c0] focus-visible:border-[#4207c0]",
        state === "error" && "border-red-500 focus-visible:ring-red-400",
    )

    return (
        <div
            className="relative min-h-screen flex items-center justify-around overflow-hidden p-4 sm:p-8 md:p-12"
            style={{ backgroundImage: "url('/FondoLogin.webp')", backgroundSize: "cover", backgroundPosition: "center" }}
        >
            {/* Overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(90deg, #3F29BA 0%, rgba(63,41,186,0) 100%)", opacity: 0.65 }}
            />

            <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-0">

                {/* Left */}
                <div className="w-full md:w-[45%] text-white text-center md:text-left px-4 md:pr-8">
                    <h1
                        className="font-extrabold leading-tight mb-4"
                        style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", textShadow: "0 6px 18px rgba(0,0,0,0.35)" }}
                    >
                        ¡Bienvenido de nuevo a Inventra!
                    </h1>
                    <p className="text-white/90 font-medium" style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}>
                        Optimiza cada sucursal y conecta todo tu negocio.
                    </p>
                </div>

                {/* Right — card */}
                <div className="w-full md:w-[55%] flex justify-center">
                    <div
                        className="w-full max-w-[480px] rounded-2xl p-8 md:p-10 flex flex-col text-center"
                        style={{
                            background: "rgba(255,255,255,0.55)",
                            border: "1px solid rgba(218,216,216,0.9)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                        }}
                    >
                        <h2 className="font-bold mb-8" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#4207c0d8" }}>
                            Iniciar sesión
                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4 text-left"
                            aria-label="Formulario de inicio de sesión"
                        >
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-[#292929] text-base font-medium">
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Input
                                        ref={emailRef}
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="usuario@empresa.com"
                                        maxLength={254}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            if (emailError) { setEmailError(""); setEmailState("idle") }
                                            if (apiError) setApiError("")
                                        }}
                                        onBlur={handleEmailBlur}
                                        className={cn(fieldBorderClass(emailState), "pr-10")}
                                        aria-invalid={emailState === "error"}
                                        aria-describedby={emailError ? "email-error" : undefined}
                                        required
                                    />
                                    {emailState === "error" && (
                                        <XCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                                    )}
                                </div>
                                <div className="min-h-[18px]">
                                    {emailError && (
                                        <p id="email-error" role="alert" className="text-red-600 text-xs flex items-center gap-1">
                                            <AlertCircle size={12} /> {emailError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[#292929] text-base font-medium">
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        maxLength={128}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            if (passwordError) { setPasswordError(""); setPasswordState("idle") }
                                            if (apiError) setApiError("")
                                        }}
                                        onBlur={handlePasswordBlur}
                                        className={cn(fieldBorderClass(passwordState), "pr-20")}
                                        aria-invalid={passwordState === "error"}
                                        aria-describedby={passwordError ? "password-error" : undefined}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5959] hover:text-[#4207c0] transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="min-h-[18px]">
                                    {passwordError && (
                                        <p id="password-error" role="alert" className="text-red-600 text-xs flex items-center gap-1">
                                            <AlertCircle size={12} /> {passwordError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Error de API + contador de intentos */}
                            <div className="min-h-[44px] flex flex-col justify-center">
                                {lockCountdown > 0 && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-center">
                                        <p className="text-red-700 text-sm font-medium">
                                            Cuenta bloqueada temporalmente
                                        </p>
                                        <p className="text-red-500 text-xs mt-0.5">
                                            Intenta de nuevo en <span className="font-bold tabular-nums">{lockCountdown}s</span>
                                        </p>
                                    </div>
                                )}
                                {apiError && lockCountdown === 0 && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                                        <p role="alert" className="text-red-700 text-sm text-center">
                                            {apiError}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="w-full h-12 text-base font-bold rounded-lg transition-all duration-200 mt-1"
                                style={{
                                    background: "transparent",
                                    border: "2px solid #4207c0",
                                    color: "#4207c0",
                                    opacity: canSubmit ? 1 : 0.45,
                                    cursor: canSubmit ? "pointer" : "not-allowed",
                                }}
                                onMouseEnter={(e) => {
                                    if (!canSubmit) return
                                    e.currentTarget.style.background = "rgba(66,7,192,0.62)"
                                    e.currentTarget.style.color = "#e9e9e9"
                                }}
                                onMouseLeave={(e) => {
                                    if (!canSubmit) return
                                    e.currentTarget.style.background = "transparent"
                                    e.currentTarget.style.color = "#4207c0"
                                }}
                                aria-busy={loading}
                            >
                                {loading
                                    ? <><Loader2 size={18} className="animate-spin mr-2 inline" /> Verificando...</>
                                    : "Iniciar sesión"
                                }
                            </Button>
                        </form>

                        <p className="mt-6 text-xs text-gray-500">
                            © {new Date().getFullYear()} Krivora Mx — Todos los derechos reservados
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}