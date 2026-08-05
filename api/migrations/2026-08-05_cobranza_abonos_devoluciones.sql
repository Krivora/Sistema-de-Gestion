-- ============================================================================
-- Cobranza de clientes, abonos, cancelaciones y devoluciones
-- Fecha: 2026-08-05
--
-- Idempotente: se puede correr varias veces sin romper nada.
-- Aplicar ANTES de reiniciar el API, o las consultas nuevas fallarán.
--
--   psql "$DATABASE_URL" -f 2026-08-05_cobranza_abonos_devoluciones.sql
-- ============================================================================

BEGIN;

-- ── 1. Cobranza de clientes (tablero de superadmin) ────────────────────────
CREATE TABLE IF NOT EXISTS client_payments (
  id         SERIAL PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  due_date   DATE NOT NULL,
  amount     NUMERIC(12,2),
  paid_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note       TEXT,
  user_id    INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT client_payments_unique_cycle UNIQUE (client_id, due_date)
);
CREATE INDEX IF NOT EXISTS idx_client_payments_client  ON client_payments (client_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_payments_paid_at ON client_payments (paid_at);

-- Suspensión automática por falta de pago y prórroga manual
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS grace_until           DATE,
  ADD COLUMN IF NOT EXISTS suspended_for_payment BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 2. Ventas a abonos ─────────────────────────────────────────────────────
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS payment_type      VARCHAR(10) NOT NULL DEFAULT 'contado',
  ADD COLUMN IF NOT EXISTS inventory_applied BOOLEAN NOT NULL DEFAULT FALSE;

-- Las ventas ya publicadas descontaron inventario en su momento.
-- Sin este backfill, publicar una venta vieja lo descontaría por segunda vez.
UPDATE sales SET inventory_applied = TRUE
 WHERE status = 'posted' AND inventory_applied = FALSE;

CREATE TABLE IF NOT EXISTS sale_payments (
  id         SERIAL PRIMARY KEY,
  sale_id    INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  client_id  INTEGER NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  method     VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
  note       TEXT,
  user_id    INTEGER,
  paid_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale ON sale_payments (sale_id, paid_at);

-- ── 3. Cancelación de ventas ───────────────────────────────────────────────
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS cancelled_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- ── 4. Devoluciones parciales ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sale_returns (
  id         SERIAL PRIMARY KEY,
  sale_id    INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  client_id  INTEGER NOT NULL,
  branch_id  INTEGER NOT NULL,
  total      NUMERIC(12,2) NOT NULL DEFAULT 0,
  credited   NUMERIC(12,2) NOT NULL DEFAULT 0,  -- aplicado a lo que debía
  refunded   NUMERIC(12,2) NOT NULL DEFAULT 0,  -- regresado en efectivo
  reason     TEXT,
  user_id    INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_return_items (
  id           SERIAL PRIMARY KEY,
  return_id    INTEGER NOT NULL REFERENCES sale_returns(id) ON DELETE CASCADE,
  sale_item_id INTEGER NOT NULL,
  product_id   INTEGER NOT NULL,
  qty          NUMERIC(12,3) NOT NULL CHECK (qty > 0),
  unit_price   NUMERIC(12,2) NOT NULL,
  client_id    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_returns_sale      ON sale_returns (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_return_items_ret  ON sale_return_items (return_id);
CREATE INDEX IF NOT EXISTS idx_sale_return_items_item ON sale_return_items (sale_item_id);

-- ── 5. Permisos ────────────────────────────────────────────────────────────
-- sales.update faltaba por completo: sin él, publicar y reabrir daban 403.
INSERT INTO permissions (key, description)
SELECT 'sales.update', 'Actualizar ventas'
 WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE key = 'sales.update');

INSERT INTO permissions (key, description)
SELECT 'sales.delete', 'Cancelar ventas'
 WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE key = 'sales.delete');

-- sales.update: los tres roles. sales.delete: solo supervisores.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
  FROM roles r CROSS JOIN permissions p
 WHERE p.key = 'sales.update'
   AND r.name IN ('superadmin', 'admin', 'employee')
   AND NOT EXISTS (
     SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
  FROM roles r CROSS JOIN permissions p
 WHERE p.key = 'sales.delete'
   AND r.name IN ('superadmin', 'admin')
   AND NOT EXISTS (
     SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- employee: solo vender, y lectura de lo que la pantalla de venta necesita
-- para cargar (sucursales, clientes, catálogo con stock).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
  FROM roles r CROSS JOIN permissions p
 WHERE r.name = 'employee'
   AND p.key IN ('sales.read', 'sales.create',
                 'branches.read', 'customers.read', 'branch_products.read')
   AND NOT EXISTS (
     SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id);

COMMIT;

-- ── Verificación ───────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
--  WHERE table_name IN ('client_payments','sale_payments','sale_returns','sale_return_items');
--
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name='sales' AND column_name IN
--    ('payment_type','inventory_applied','cancelled_at','cancel_reason');
--
-- SELECT r.name, p.key FROM roles r
--   JOIN role_permissions rp ON rp.role_id=r.id
--   JOIN permissions p ON p.id=rp.permission_id
--  WHERE p.key LIKE 'sales%' ORDER BY r.name, p.key;
