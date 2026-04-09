import { useAbility } from "./AbilityContext";

// Uso: <Can do="create" on="products">...</Can>
export default function Can({ do: action, on: subject, children, fallback = null }) {
  const ability = useAbility();
  return ability.can(action, subject) ? children : fallback;
}