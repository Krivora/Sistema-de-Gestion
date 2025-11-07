  import pool from "../config/db.js";
  import * as PurchaseRepo from "../repositories/purchase.repository.js";
  import * as InventoryRepo from "../repositories/inventory.repository.js";

  /**
   * 🧾 Crea y publica una compra (afecta inventario y logs)
   */
  export async function createAndPostPurchase(payload, user) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { client_id, id: user_id } = user;
      const { branch_id, items } = payload;

      if (!items?.length) throw new Error("La compra requiere productos");

      // Crear encabezado
      const purchase = await PurchaseRepo.createHeader(client, {
        ...payload,
        client_id,
        user_id,
      });

      // Procesar cada item
      for (const item of items) {
        const qty = Number(item.qty);
        const cost = Number(item.unit_cost);
        if (qty <= 0) throw new Error("Cantidad inválida");
        if (cost < 0) throw new Error("Costo inválido");

        // Insertar item
        await PurchaseRepo.addItem(client, {
          purchase_id: purchase.id,
          product_id: item.product_id,
          qty,
          unit_cost: cost,
          client_id,
        });

        // 🔁 Movimiento de inventario unificado
        await InventoryRepo.createAndApply(
          client, // 🔹 el objeto client activo de la transacción
          {
            branch_id,
            product_id: item.product_id,
            qty,
            type: "PURCHASE",
            unit_cost: cost,
            note: `Compra ${purchase.doc_no || purchase.id}`,
            ref_type: "purchases",
            ref_id: purchase.id,
          },
          client_id,
          user_id
        );
      }

      // Publicar
      const posted = await PurchaseRepo.setPosted(client, purchase.id, client_id);

      await InventoryRepo.logActivity(
        client,
        user_id,
        client_id,
        "CREATE_PURCHASE",
        `Compra ${posted.doc_no || posted.id} creada (${items.length} productos)`,
        "purchases",
        posted.id
      );

      await client.query("COMMIT");
      const itemsResp = await PurchaseRepo.findItems(purchase.id, client_id);
      return { ...posted, items: itemsResp };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  /**
   * 📋 Listar y obtener compras
   */
  export async function listPurchases(client_id, filters) {
    return await PurchaseRepo.findAll(client_id, filters);
  }

  export async function getPurchaseById(id, client_id) {
    const header = await PurchaseRepo.findById(id, client_id);
    if (!header) return null;
    const items = await PurchaseRepo.findItems(id, client_id);
    return { ...header, items };
  }
