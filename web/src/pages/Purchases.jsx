import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { usePurchases } from "../hooks/usePurchases";
import { PurchasesApi } from "../api";
import PurchaseTable from "../components/purchases/PurchaseTable";
import PurchaseForm from "../components/purchases/PurchaseForm";
import PurchaseDetails from "../components/purchases/PurchaseDetails";
import { useToast } from "../utils/toastUtils";
import { useAlert } from "../utils/alertUtils";
import { useNotify } from "../utils/notifyUtils";

export default function Purchases() {
  const { purchases, loading, createPurchase, deletePurchase } = usePurchases();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const toast = useToast();
  const alert = useAlert();
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

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar compra?",
      text: "Esta acción también eliminará los movimientos de inventario asociados.",
    });
    if (!confirmed) return;
    try {
      await deletePurchase(id);
      notify.warning("Compra eliminada", "La compra fue eliminada correctamente");
    } catch {
      toast.error("Error al eliminar la compra");
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

      <PurchaseTable purchases={purchases} loading={loading} onDelete={handleDelete} onView={handleView} />

      <PurchaseForm open={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <PurchaseDetails open={detailOpen} onClose={() => setDetailOpen(false)} purchase={selectedPurchase} />
    </div>
  );
}
