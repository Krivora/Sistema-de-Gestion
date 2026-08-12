-- ============================================================================
-- Ventas por mayoreo: paquetes fijos y paquetes armables
-- Fecha: 2026-08-12
--
-- Idempotente: se puede correr varias veces sin romper nada.
-- Aplicar ANTES de reiniciar el API, o las consultas nuevas fallarán.
--
--   psql "$DATABASE_URL" -f 2026-08-12_paquetes_mayoreo.sql
-- ============================================================================

BEGIN;

-- ── 1. Catálogo de paquetes ────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS packages_code_seq;

CREATE TABLE IF NOT EXISTS packages (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  code        VARCHAR(30) NOT NULL,
  name        VARCHAR(120) NOT NULL,
  description TEXT,
  -- 'fixed'    → el contenido lo define el catálogo (mismo surtido siempre).
  -- 'flexible' → el vendedor arma el paquete al momento ("5 piezas a elegir").
  kind        VARCHAR(10) NOT NULL DEFAULT 'fixed'
              CHECK (kind IN ('fixed', 'flexible')),
  -- Precio fijo de todo el paquete. Se reparte entre los componentes al vender.
  price       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  -- Solo 'flexible': cuántas piezas debe llevar el paquete para poder venderse.
  item_count  NUMERIC(14,4),
  -- Qué productos pueden entrar en un paquete flexible:
  --   any      → cualquiera de la sucursal
  --   category → solo los de category_id
  --   list     → solo los listados en package_items
  selection_scope VARCHAR(10) NOT NULL DEFAULT 'any'
                  CHECK (selection_scope IN ('any', 'category', 'list')),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  status      status_enum NOT NULL DEFAULT 'active',
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS packages_client_code_key ON packages (client_id, code);
CREATE INDEX IF NOT EXISTS idx_packages_client ON packages (client_id, status);

-- En 'fixed' son los componentes con su cantidad.
-- En 'flexible' + selection_scope='list' son los productos permitidos (qty se ignora).
CREATE TABLE IF NOT EXISTS package_items (
  id         SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty        NUMERIC(14,4) NOT NULL DEFAULT 1 CHECK (qty > 0),
  client_id  INTEGER NOT NULL,
  CONSTRAINT package_items_unique UNIQUE (package_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_package_items_package ON package_items (package_id);

-- ── 2. Paquetes dentro de una venta ────────────────────────────────────────
-- Cada renglón es un paquete vendido. Los productos siguen viviendo en
-- sale_items (apuntando aquí), así que inventario, devoluciones, cancelaciones
-- y totales siguen funcionando exactamente igual que con productos sueltos.
CREATE TABLE IF NOT EXISTS sale_packages (
  id         SERIAL PRIMARY KEY,
  sale_id    INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  client_id  INTEGER NOT NULL,
  -- Copia del nombre: el ticket de una venta vieja no debe cambiar porque
  -- alguien renombró el paquete después.
  name       VARCHAR(120) NOT NULL,
  qty        NUMERIC(14,4) NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sale_packages_sale ON sale_packages (sale_id);

ALTER TABLE sale_items
  ADD COLUMN IF NOT EXISTS sale_package_id INTEGER REFERENCES sale_packages(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_sale_items_package ON sale_items (sale_package_id);

-- ── 3. Precisión del precio unitario ───────────────────────────────────────
-- El precio del paquete se prorratea entre sus componentes. Con dos decimales
-- un paquete de $500 entre 3 piezas no cierra (166.66 × 3 = 499.98) y el total
-- de la venta quedaría desfasado. Con cuatro, el error queda muy por debajo del
-- centavo al que se redondea el total de la venta.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'sale_items' AND column_name = 'unit_price'
       AND numeric_scale < 4
  ) THEN
    ALTER TABLE sale_items ALTER COLUMN unit_price TYPE NUMERIC(14,4);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'sale_return_items' AND column_name = 'unit_price'
       AND numeric_scale < 4
  ) THEN
    ALTER TABLE sale_return_items ALTER COLUMN unit_price TYPE NUMERIC(14,4);
  END IF;
END $$;

-- ── 4. Permisos ────────────────────────────────────────────────────────────
INSERT INTO permissions (key, description)
SELECT v.key, v.description
  FROM (VALUES
    ('packages.read',   'Ver paquetes'),
    ('packages.create', 'Crear paquetes'),
    ('packages.update', 'Actualizar paquetes'),
    ('packages.delete', 'Eliminar paquetes')
  ) AS v(key, description)
 WHERE NOT EXISTS (SELECT 1 FROM permissions p WHERE p.key = v.key);

-- superadmin y admin administran el catálogo
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
  FROM roles r CROSS JOIN permissions p
 WHERE p.key IN ('packages.read', 'packages.create', 'packages.update', 'packages.delete')
   AND r.name IN ('superadmin', 'admin')
   AND NOT EXISTS (
     SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id);

-- employee solo vende: necesita leer el catálogo para poder armar el paquete,
-- nunca editarlo.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
  FROM roles r CROSS JOIN permissions p
 WHERE p.key = 'packages.read'
   AND r.name = 'employee'
   AND NOT EXISTS (
     SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id);

COMMIT;

-- ── Verificación ───────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
--  WHERE table_name IN ('packages','package_items','sale_packages');
--
-- SELECT column_name, numeric_scale FROM information_schema.columns
--  WHERE table_name='sale_items' AND column_name IN ('unit_price','sale_package_id');
--
-- SELECT r.name, p.key FROM roles r
--   JOIN role_permissions rp ON rp.role_id=r.id
--   JOIN permissions p ON p.id=rp.permission_id
--  WHERE p.key LIKE 'packages%' ORDER BY r.name, p.key;
