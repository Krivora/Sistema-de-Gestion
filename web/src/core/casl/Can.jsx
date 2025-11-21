// src/casl/Can.jsx
import { useContext } from "react";
import { AbilityContext } from "./AbilityContext";

export default function Can({ I, a, children }) {
  const ability = useContext(AbilityContext);

  return ability.can(I, a) ? children : null;
}
