import { useMemo } from "react";
import { Edit, Delete, PowerSettingsNew, RestartAlt } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import DataTable from "@core/components/common/DataTable";

const truncate = (text = "", max = 60) =>
  text.length > max ? text.slice(0, max) + "…" : text;

const STATUS_MAP = {
  active: { label: "Activo", color: "var(--color-success)", bg: "var(--color-success-soft)" },
  inactive: { label: "Inactivo", color: "var(--color-warning)", bg: "var(--color-warning-soft)" },
  deleted: { label: "Eliminado", color: "var(--color-text-muted)", bg: "var(--color-surface-2)" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.deleted;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function ActionButtons({ p, onEdit, onActivate, onDeactivate, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      {p.status !== "deleted" && (
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(p)}
            sx={{ color: "var(--color-text-muted)", "&:hover": { color: "var(--color-primary)", background: "var(--color-primary-soft)" } }}>
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
      {p.status === "active" && (
        <Tooltip title="Desactivar">
          <IconButton size="small" onClick={() => onDeactivate(p.id)}
            sx={{ color: "var(--color-warning)", "&:hover": { background: "var(--color-warning-soft)" } }}>
            <PowerSettingsNew sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
      {p.status === "inactive" && (
        <>
          <Tooltip title="Activar">
            <IconButton size="small" onClick={() => onActivate(p.id)}
              sx={{ color: "var(--color-success)", "&:hover": { background: "var(--color-success-soft)" } }}>
              <RestartAlt sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => onDelete(p)}
              sx={{ color: "var(--color-danger)", "&:hover": { background: "var(--color-danger-soft)" } }}>
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
}

export default function ProductTable({ products = [], loading, onEdit, onDelete, onActivate, onDeactivate }) {
  const columns = useMemo(() => [
    { key: "name", label: "Nombre" },
    { key: "sku", label: "SKU", render: v => v || "—" },
    { key: "category_name", label: "Categoría", render: v => v || "Sin categoría" },
    {
      key: "description",
      label: "Descripción",
      render: v => v
        ? <span style={{ color: "var(--color-text-secondary)" }}>{truncate(v)}</span>
        : <span style={{ color: "var(--color-text-muted)" }} className="italic">Sin descripción</span>
    },
    { key: "status", label: "Estado", render: v => <StatusBadge status={v} /> },
  ], []);

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>

      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable
          data={products}
          loading={loading}
          dense
          placeholder="Buscar producto..."
          defaultSort={{ key: "name", direction: "asc" }}
          columns={columns}
          renderActions={p => (
            <ActionButtons
              p={p}
              onEdit={onEdit}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onDelete={onDelete}
            />
          )}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y" style={{ borderColor: "var(--color-border-soft)" }}>
        {loading ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Cargando productos...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
            No hay productos registrados.
          </p>
        ) : products.map(p => (
          <div key={p.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                  {p.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {p.sku || "Sin SKU"} · {p.category_name || "Sin categoría"}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            {p.description && (
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {truncate(p.description, 80)}
              </p>
            )}
            <div className="flex justify-end">
              <ActionButtons p={p} onEdit={onEdit} onActivate={onActivate}
                onDeactivate={onDeactivate} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}