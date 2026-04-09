import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function buildAbility(permissionKeys = []) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  permissionKeys.forEach((key) => {
    const [subject, action] = key.split(".");
    if (subject && action) can(action, subject);
  });

  return build();
}