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
  Box,
  Chip,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { fmtDate } from "@core/utils/formatters/formatters";
export default function PurchaseDetails({ open, onClose, purchase }) {
  const theme = useTheme();
  if (!purchase) return null;

  const total = purchase.items?.reduce((sum, i) => sum + i.qty * i.unit_cost, 0) || 0;
  const bgSoft = alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.06);
  const borderSoft = alpha(theme.palette.primary.main, 0.15);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          pb: 0,
          fontWeight: 600,
          color: theme.palette.primary.main,
        }}
      >
        Detalles de la compra
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3, px: 4 }}>
        {/* 🧾 Encabezado */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
            mb: 3,
            borderRadius: 2,
            p: 3,
            backgroundColor: bgSoft,
            border: `1px solid ${borderSoft}`,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">
              Folio:{" "}
              <span style={{ fontWeight: 400 }}>{purchase.doc_no || "—"}</span>
            </Typography>
            <Chip
              label={purchase.status ? "Cerrada" : "open"}
              color={purchase.status ? "success" : "warning"}
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            <strong>Sucursal:</strong> {purchase.branch_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fecha:{" "}
            <strong>
              {fmtDate(purchase.created_at)}
            </strong>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Compra Autorizada Por:{" "}
            <strong>{purchase.user_name}</strong>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 📦 Tabla de productos */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === "dark"
                ? "none"
                : "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                px: 3,
                pt: 2,
                pb: 1.5,
                color: theme.palette.text.primary,
              }}
            >
              Productos comprados
            </Typography>

            {purchase.items?.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Cantidad
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Costo Unitario
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">
                        {Number(item.qty).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${Number(item.unit_cost).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${(item.qty * item.unit_cost).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                      Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ${total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Box p={3}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No hay productos registrados en esta compra.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
