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
import { ArrowRightAlt } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { fmtDate } from "@core/utils/formatters/formatters";
export default function TransferDetails({ open, onClose, transfer }) {
  const theme = useTheme();
  if (!transfer) return null;

  const bgSoft = alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.06);
  const borderSoft = alpha(theme.palette.primary.main, 0.15);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          pb: 0,
          fontWeight: 600,
        }}
      >
        Detalles de la transferencia
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
              Folio: <span style={{ fontWeight: 400 }}>{transfer.doc_no || "—"}</span>
            </Typography>
            <Chip
              label={transfer.posted ? "Completada" : "Pendiente"}
              color={transfer.posted ? "success" : "warning"}
              size="small"
              variant="outlined"
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              De:
            </Typography>
            <Typography variant="body2">{transfer.from_branch_name}</Typography>
            <ArrowRightAlt
              sx={{
                color: theme.palette.primary.main,
                fontSize: 20,
              }}
            />
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              A:
            </Typography>
            <Typography variant="body2">{transfer.to_branch_name}</Typography>
          </Box>

          {transfer.note && (
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: theme.palette.text.secondary,
                mt: 0.5,
              }}
            >
              Nota:{transfer.note}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary">
            Fecha:{" "}
            <strong>
              {fmtDate(transfer.created_at)}
            </strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transferencia Autorizada Por:{" "}
            <strong>{transfer.user_name}</strong>
          </Typography>

        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 🧩 Tabla de productos */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.palette.mode === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
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
              Productos transferidos
            </Typography>

            {transfer.items?.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Cantidad
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transfer.items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">
                        {Number(item.qty).toFixed(2)}
                      </TableCell>
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
                  No hay productos registrados en esta transferencia.
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
