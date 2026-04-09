import { createContext, useContext } from "react";
import { ability } from "./ability";

export const AbilityContext = createContext(ability);

export function useAbility() {
  const ctx = useContext(AbilityContext);
  if (!ctx) throw new Error("useAbility debe usarse dentro de <AuthProvider>");
  return ctx;
}