// src/casl/AbilityContext.jsx
import { createContext, useContext } from "react";
import { ability } from "./ability";

export const AbilityContext = createContext(ability);

export function AbilityProvider({ children }) {
  // ❗️ NO actualizar ability aquí
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}
