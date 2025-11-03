import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { usePurchases } from "../hooks/usePurchases";
import { PurchasesApi } from "../api/purchases";
import PurchaseTable from "../components/PurchaseTable";
import PurchaseForm from "../components/PurchaseForm";
import PurchaseDetails from "../components/PurchaseDetails";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";

export default function Purchases() {
  const { purchases, loading, createPurchase} = usePurchases();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const toast = useToast();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      await createPurchase(data);
      notify.success("Compra creada", "La compra se registró correctamente");
      setOpen(false);
    } catch {
      toast.error("Error al guardar la compra");
    }
  };

  const handleView = async (purchase) => {
    try {
      const full = await PurchasesApi.get(purchase.id);
      setSelectedPurchase(full);
      setDetailOpen(true);
    } catch {
      toast.error("Error al obtener detalles de la compra");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Compras</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nueva Compra
        </Button>
      </div>

      <PurchaseTable purchases={purchases} loading={loading} onView={handleView} />

      <PurchaseForm open={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <PurchaseDetails open={detailOpen} onClose={() => setDetailOpen(false)} purchase={selectedPurchase} />
    </div>
  );
}
