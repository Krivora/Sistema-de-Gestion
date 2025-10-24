import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSales } from "@/hooks/useSales";
import { SalesApi } from "@/api";
import SaleTable from "@/components/client/sales/SaleTable";
import SaleForm from "@/components/client/sales/SaleForm";
import SaleDetails from "@/components/client/sales/SaleDetails";
import useSalePrint from "@/components/client/sales/SalePrint";
import { useToast } from "@/utils/toastUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function Sales() {
  const { sales, loading, createSale, deleteSale } = useSales();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const { handleDownloadPDF  } = useSalePrint();

  const toast = useToast();
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

      <SaleTable sales={sales} loading={loading} onView={handleView}  onDownload={(s) => handleDownloadPDF(s.id)} />

      <SaleForm open={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <SaleDetails open={detailOpen} onClose={() => setDetailOpen(false)} sale={selectedSale} />
    </div>
  );
}
