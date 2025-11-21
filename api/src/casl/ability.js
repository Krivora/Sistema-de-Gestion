// src/casl/ability.js
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function buildAbility(permissionKeys = []) {
  const builder = new AbilityBuilder(createMongoAbility);
  const { can, cannot } = builder;

  permissionKeys.forEach((key) => {
    const [subject, action] = key.split(".");

    if (subject && action) {
      can(action, subject); // Ej: "branches.read" => can("read", "branches")
    }
  });

  return builder.build();
}
