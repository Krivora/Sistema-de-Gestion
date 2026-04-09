import { PureAbility } from "@casl/ability";

// Singleton mutable — se actualiza en login/logout via ability.update(rules)
export const ability = new PureAbility([]);