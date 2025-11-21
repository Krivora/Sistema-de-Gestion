// src/core/casl/ability.js
import { PureAbility } from "@casl/ability";

export const ability = new PureAbility([], {
  detectSubjectType: (item) => item.type,
});
