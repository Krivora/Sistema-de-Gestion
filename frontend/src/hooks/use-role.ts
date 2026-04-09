import { useAuthStore } from "@/store/auth.store"

export function useRole() {
    const user = useAuthStore((s) => s.user)
    return {
        role: user?.role_name,
        isSuperAdmin: user?.role_name === "superadmin",
        isAdmin: user?.role_name === "admin",
        isUser: user?.role_name === "user",
    }
}