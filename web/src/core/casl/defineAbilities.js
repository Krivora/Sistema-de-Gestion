// src/casl/defineAbilities.js

// Recibe permisos tipo: ["branches.read", "products.create", ...]
// Devuelve reglas CASL tipo:
// [{ action: "read", subject: "branches" }, ...]

export function buildRulesFromPermissions(permissionKeys = []) {
  return permissionKeys
    .map((key) => {
      const [subject, action] = key.split(".");
      if (!subject || !action) return null;

      return { action, subject };
    })
    .filter(Boolean);
}
