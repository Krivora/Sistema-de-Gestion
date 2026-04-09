import { useMemo } from "react"
import { useAuthStore } from "@/store/auth.store"
import { buildAbility } from "@/lib/ability"

export function useAbility() {
    const rules = useAuthStore((s) => s.abilityRules)
    return useMemo(() => buildAbility(rules), [rules])
}