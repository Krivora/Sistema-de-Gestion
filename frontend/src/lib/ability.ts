import { createMongoAbility, type MongoAbility } from "@casl/ability"
import type { AbilityRule } from "@/types/api.types"

export type AppAbility = MongoAbility

export function buildAbility(rules: AbilityRule[]): AppAbility {
    return createMongoAbility(rules.map(({ action, subject }) => ({ action, subject })))
}