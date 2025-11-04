export async function seedDefaultCatalogs(client, clientId) {
  // 🧾 Crear catálogos base
  const { rows: catalogs } = await client.query(
    `INSERT INTO catalogs (client_id, code, name, description)
     VALUES
       ($1, 'adjustment_notes', 'Motivos de Ajuste', 'Motivos predefinidos para ajustes de inventario'),
       ($1, 'transfer_reasons', 'Motivos de Transferencia', 'Motivos para transferencias entre sucursales')
     RETURNING id, code`,
    [clientId]
  );

  // 🧠 Mapear IDs
  const adjustmentCatalog = catalogs.find((c) => c.code === "adjustment_notes");
  const transferCatalog = catalogs.find((c) => c.code === "transfer_reasons");

  // 🟢 Motivos de ajuste
  await client.query(
    `INSERT INTO catalog_items (catalog_id, label, metadata)
     VALUES
      ($1, 'Devolución de cliente', '{"type": "ADJUSTMENT_IN"}'),
      ($1, 'Ajuste por conteo físico', '{"type": "ADJUSTMENT_IN"}'),
      ($1, 'Bonificación de proveedor', '{"type": "ADJUSTMENT_IN"}'),
      ($1, 'Reingreso por reparación', '{"type": "ADJUSTMENT_IN"}'),
      ($1, 'Pérdida o merma', '{"type": "ADJUSTMENT_OUT"}'),
      ($1, 'Robo o extravío', '{"type": "ADJUSTMENT_OUT"}'),
      ($1, 'Muestra o donación', '{"type": "ADJUSTMENT_OUT"}'),
      ($1, 'Producto defectuoso', '{"type": "ADJUSTMENT_OUT"}')`,
    [adjustmentCatalog.id]
  );

  // 🔁 Motivos de transferencia
  await client.query(
    `INSERT INTO catalog_items (catalog_id, label, metadata)
    VALUES
      ($1, 'Reabastecimiento de sucursal', '{"type": "TRANSFER_OUT"}'),
      ($1, 'Devolución a almacén central', '{"type": "TRANSFER_IN"}'),
      ($1, 'Movimiento entre almacenes', '{"type": "TRANSFER_OUT"}'),
      ($1, 'Transferencia por ajuste de ubicación', '{"type": "TRANSFER_OUT"}'),
      ($1, 'Transferencia temporal', '{"type": "TRANSFER_OUT"}')`,
    [transferCatalog.id]
  );
}
