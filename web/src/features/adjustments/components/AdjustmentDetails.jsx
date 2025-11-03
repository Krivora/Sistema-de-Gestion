import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function AdjustmentDetails({ open, onClose, adjustment }) {
  if (!adjustment) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Detalles del Ajuste #{adjustment.id}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Sucursal:</strong> {adjustment.branch_name}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Nota general:</strong> {adjustment.note || "—"}
        </Typography>

        <h4 className="font-medium mb-2 mt-3">Productos ajustados</h4>
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="text-left py-2">Producto</th>
              <th className="text-left py-2">Cantidad</th>
              <th className="text-left py-2">Tipo</th>
              <th className="text-left py-2">Nota</th>
            </tr>
          </thead>
          <tbody>
            {adjustment.items?.map((i, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{i.product_name}</td>
                <td>{i.qty}</td>
                <td>{i.type === "ADJUSTMENT_IN" ? "Entrada" : "Salida"}</td>
                <td>{i.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
