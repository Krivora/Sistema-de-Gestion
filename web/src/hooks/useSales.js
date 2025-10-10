import { useEffect, useState } from "react";
import { SalesApi } from "../api";

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchSales() {
    setLoading(true);
    try {
      const data = await SalesApi.list();
      setSales(data);
    } finally {
      setLoading(false);
    }
  }

  async function createSale(sale) {
    const created = await SalesApi.create(sale);
    setSales((prev) => [created, ...prev]);
  }

  async function deleteSale(id) {
    await SalesApi.remove(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }

  useEffect(() => {
    fetchSales();
  }, []);

  return { sales, loading, createSale, deleteSale };
}
