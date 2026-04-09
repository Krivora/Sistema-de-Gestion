// ["products.read", "sales.create"] → [{ action: "read", subject: "products" }, ...]
export function buildRulesFromPermissions(permissionKeys = []) {
  return permissionKeys.reduce((rules, key) => {
    const parts = key.split(".");
    if (parts.length === 2 && parts[0] && parts[1]) {
      rules.push({ action: parts[1], subject: parts[0] });
    }
    return rules;
  }, []);
}