import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSales } from "../hooks/useSales";
import { SalesApi } from "../api";
import SaleTable from "../components/sales/SaleTable";
import SaleForm from "../components/sales/SaleForm";
import SaleDetails from "../components/sales/SaleDetails";
import useSalePrint from "../components/sales/SalePrint";
import { useToast } from "../utils/toastUtils";
import { useAlert } from "../utils/alertUtils";
import { useNotify } from "../utils/notifyUtils";

export default function Sales() {
  const { sales, loading, createSale, deleteSale } = useSales();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const { handleDownloadPDF  } = useSalePrint();

  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      await createSale(data);
      notify.success("Venta creada", "La venta se registró correctamente");
      setOpen(false);
    } catch {
      toast.error("Error al guardar la venta");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar venta?",
      text: "Esta acción también eliminará los movimientos de inventario asociados.",
    });
    if (!confirmed) return;
    try {
      await deleteSale(id);
      notify.warning("Venta eliminada", "La venta fue eliminada correctamente");
    } catch {
      toast.error("Error al eliminar la venta");
    }
  };

  
  const handleView = async (sale) => {
    try {
      const full = await SalesApi.get(sale.id);
      setSelectedSale(full);
      setDetailOpen(true);
    } catch {
      toast.error("Error al obtener detalles de la venta");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ventas</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nueva Venta
        </Button>
      </div>

      <SaleTable sales={sales} loading={loading} onDelete={handleDelete} onView={handleView}  onDownload={(s) => handleDownloadPDF(s.id)} />

      <SaleForm open={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <SaleDetails open={detailOpen} onClose={() => setDetailOpen(false)} sale={selectedSale} />
    </div>
  );
}
