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
    try {
      const created = await SalesApi.create(sale);
      await fetchSales();
      return created;
    } catch (err) {
      console.error("Error en createSale:", err);
    }
  }


  useEffect(() => {
    fetchSales();
  }, []);

  return { sales, loading, createSale };
}
