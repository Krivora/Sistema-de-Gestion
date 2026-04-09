import { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAuth } from "@core/auth/useAuth"

export default function TransfersNoteForm({ createItem }) {
  const { user } = useAuth();
  const [newLabel, setNewLabel] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("TRANSFER_OUT"); // 🔹 Por default: Salida (puedes cambiarlo si prefieres)

  const handleAdd = async () => {
    if (!newLabel.trim()) return;

    await createItem({
      label: newLabel,
      value: value || newLabel.toUpperCase().replace(/\s+/g, "_"),
      metadata: { type }, // 🔹 Guarda el tipo en metadata
      created_by: user?.id,
    });

    setNewLabel("");
    setValue("");
    setType("TRANSFER_OUT");
  };

  return (
    <div className="flex gap-3 items-center flex-wrap">
      <TextField
        label="Motivo de transferencia"
        value={newLabel}
        onChange={(e) => setNewLabel(e.target.value)}
        size="small"
        sx={{ minWidth: 300 }}
      />

      <TextField
        select
        label="Tipo de movimiento"
        value={type}
        onChange={(e) => setType(e.target.value)}
        size="small"
        sx={{ width: 180 }}
      >
        <MenuItem value="TRANSFER_IN">Entrada</MenuItem>
        <MenuItem value="TRANSFER_OUT">Salida</MenuItem>
      </TextField>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAdd}
        sx={{ height: 40 }}
      >
        Agregar
      </Button>
    </div>
  );
}
