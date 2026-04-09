"use client"
import { useAbility } from "@/hooks/use-ability"
import { useRole } from "@/hooks/use-role"

interface CanProps {
    action?: string
    subject?: string
    role?: string | string[]
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function Can({ action, subject, role, children, fallback = null }: CanProps) {
    const ability = useAbility()
    const { role: userRole } = useRole()

    // Verificación por rol
    if (role) {
        const roles = Array.isArray(role) ? role : [role]
        if (!roles.includes(userRole ?? "")) return <>{fallback}</>
    }

    // Verificación por permiso CASL
    if (action && subject) {
        if (!ability.can(action, subject)) return <>{fallback}</>
    }

    return <>{children}</>
}