import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, AbilityRule } from "@/types/api.types"
import { TOKEN_KEY } from "@/lib/constants"
import { useEntityStore } from "./entity.store"

interface AuthState {
    user: User | null
    token: string | null
    abilityRules: AbilityRule[]
    setAuth: (user: User, token: string, rules: AbilityRule[]) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            abilityRules: [],
            setAuth: (user, token, abilityRules) => {
                localStorage.setItem(TOKEN_KEY, token)
                document.cookie = `inv_role=${user.role_name}; path=/; SameSite=Lax`
                document.cookie = `inv_token=${token}; path=/; SameSite=Lax`
                set({ user, token, abilityRules })
            },
            logout: () => {
                localStorage.clear()
                document.cookie = "inv_role=; path=/; max-age=0"
                document.cookie = "inv_token=; path=/; max-age=0"
                useEntityStore.getState().reset()
                set({ user: null, token: null, abilityRules: [] })
            },
        }),
        { name: "auth-store" }
    )
)