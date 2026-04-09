import { useState } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAuth } from "@core/auth/useAuth"

export default function AdjustmentNotesForm({ createItem }) {
  const { user } = useAuth();
  const [newLabel, setNewLabel] = useState("");
  const [type, setType] = useState("ADJUSTMENT_IN"); // Entrada por default
  const [value, setValue] = useState("");

  const handleAdd = async () => {
    if (!newLabel.trim()) return;

    await createItem({
      label: newLabel,
      value: value || newLabel.toUpperCase().replace(/\s+/g, "_"), // valor interno opcional
      metadata: { type },
      created_by: user?.id,
    });

    setNewLabel("");
    setType("ADJUSTMENT_IN");
    setValue("");
  };

  return (
    <div className="flex gap-3 items-center flex-wrap">
      <TextField
        label="Motivo"
        value={newLabel}
        onChange={(e) => setNewLabel(e.target.value)}
        size="small"
        sx={{ minWidth: 250 }}
      />

      <TextField
        select
        label="Tipo"
        value={type}
        onChange={(e) => setType(e.target.value)}
        size="small"
        sx={{ width: 180 }}
      >
        <MenuItem value="ADJUSTMENT_IN">Entrada</MenuItem>
        <MenuItem value="ADJUSTMENT_OUT">Salida</MenuItem>
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
