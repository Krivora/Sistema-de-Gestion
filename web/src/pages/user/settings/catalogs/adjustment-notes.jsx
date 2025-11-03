import { useCatalog } from "@/hooks/useCatalogs";
import { useState } from "react";
import { Button, TextField, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { Add, Delete, Restore } from "@mui/icons-material";

export default function AdjustmentNotesCatalog() {
  const { items, loading, createItem, deleteItem, restoreItem } = useCatalog("adjustment_notes");
  const [label, setLabel] = useState("");

  const handleAdd = async () => {
    if (!label.trim()) return;
    await createItem({ label, metadata: { type: "ADJUSTMENT_IN" } });
    setLabel("");
  };

  if (loading) return <CircularProgress />;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Motivos de Ajuste</h2>

      <div className="flex gap-2 items-center">
        <TextField
          label="Nuevo motivo"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          size="small"
        />
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Agregar
        </Button>
      </div>

      <div className="mt-4 border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Motivo</th>
              <th className="text-left px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-2">{i.label}</td>
                <td className="px-4 py-2 flex gap-2">
                  {i.deleted_at ? (
                    <Tooltip title="Restaurar">
                      <IconButton size="small" onClick={() => restoreItem(i.id)}>
                        <Restore fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => deleteItem(i.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center text-gray-400 py-4">
                  No hay motivos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
