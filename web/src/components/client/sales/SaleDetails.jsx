import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
} from "@mui/material";

export default function SaleDetails({ open, onClose, sale }) {
  if (!sale) return null;
  const total = sale.items?.reduce((acc, i) => acc + i.qty * i.unit_price, 0) || 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Detalle de Venta</DialogTitle>
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Encabezado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Folio
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {sale.doc_no}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Sucursal
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {sale.branch_name ?? "—"}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Cliente
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {sale.customer_name || "Público General"}
            </Typography>

            {sale.customer_phone && (
              <Typography variant="body2" color="text.secondary">
                {sale.customer_phone}
              </Typography>
            )}
          </div>


          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Método de Pago
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {sale.payment_method || "Efectivo"}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                sale.status === "open"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {sale.status === "open" ? "Abierta" : "Cerrada"}
            </span>
          </div>

          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {new Date(
                  new Date(sale.created_at).getTime() - 7 * 60 * 60 * 1000
                ).toLocaleString("es-MX")}
            </Typography>
          </div>
        </div>

        <Divider sx={{ my: 2 }} />

        {/* Productos */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Productos vendidos
        </Typography>

        {sale.items?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="text-left py-2">Producto</th>
                  <th className="text-right py-2">Cantidad</th>
                  <th className="text-right py-2">Precio Unitario</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((i, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{i.product_name}</td>
                    <td className="text-right">{i.qty}</td>
                    <td className="text-right">${Number(i.unit_price).toFixed(2)}</td>
                    <td className="text-right">${(Number(i.qty) * Number(i.unit_price)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay productos registrados.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography align="right" variant="h6" fontWeight="bold">
          Total: ${total.toFixed(2)}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
