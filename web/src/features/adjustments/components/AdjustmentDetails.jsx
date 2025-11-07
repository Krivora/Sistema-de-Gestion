import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { fmtDate } from "@core/utils/formatters/formatters";
export default function AdjustmentDetails({ open, onClose, adjustment }) {
  const theme = useTheme();
  if (!adjustment) return null;
  const bgSoft = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.1 : 0.06
  );
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
        ⚙️ Detalles del ajuste
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
              <span style={{ fontWeight: 400 }}>
                {adjustment.doc_no || "—"}
              </span>
            </Typography>

            <Chip
              label={
                adjustment.type === "ADJUSTMENT_IN"
                  ? "Ajuste de Entrada"
                  : "Ajuste de Salida"
              }
              color={
                adjustment.type === "ADJUSTMENT_IN" ? "success" : "error"
              }
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            <strong>Sucursal:</strong> {adjustment.branch_name}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Ajuste Autorizado Por:</strong>{" "}
            {adjustment.user_name}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Fecha:</strong>{" "}
            {fmtDate(adjustment.created_at)}
          </Typography>

          {adjustment.note && (
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: theme.palette.text.secondary,
                mt: 0.5,
              }}
            >
              Nota General: {adjustment.note}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 📦 Tabla de productos ajustados */}
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
              Productos ajustados
            </Typography>

            {adjustment.items?.length > 0 ? (
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
                    <TableCell sx={{ fontWeight: 600 }}>Nota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adjustment.items.map((item, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">
                        {Number(item.qty).toFixed(2)}
                      </TableCell>
                      <TableCell>{item.note || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box p={3}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No hay productos registrados en este ajuste.
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
