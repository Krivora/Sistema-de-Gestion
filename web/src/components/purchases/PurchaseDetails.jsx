import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Divider,
} from "@mui/material";

export default function PurchaseDetails({ open, onClose, purchase }) {
  if (!purchase) return null;

  const total = purchase.items?.reduce(
    (sum, i) => sum + i.qty * i.unit_cost,
    0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Detalles de la compra</DialogTitle>

      <DialogContent dividers>
        {/* Encabezado */}
        <div className="space-y-2 mb-4">
          <Typography variant="subtitle1" fontWeight="bold">
            Folio: {purchase.doc_no}
          </Typography>
          <Typography variant="body2">
            <strong>Sucursal:</strong> {purchase.branch_name}
          </Typography>
          <Typography variant="body2">
            <strong>Fecha:</strong>{" "}
            {new Date(purchase.created_at).toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <strong>Estado:</strong>{" "}
            {purchase.status === "open" ? "Abierta" : "Cerrada"}
          </Typography>
        </div>

        <Divider sx={{ my: 2 }} />

        {/* Tabla de ítems */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Productos
        </Typography>
        {purchase.items && purchase.items.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Costo Unitario</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">
                    ${Number(item.unit_cost).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${(item.qty * item.unit_cost).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: "bold" }}>
                  Total:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  ${total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay productos registrados en esta compra.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
