import { SalesApi } from "../../api";
import { useToast } from "../../utils/toastUtils";
import logo from "../../../public/lechuSnacks.png";

export default function useSalePrint() {
  const toast = useToast();

  const handlePrint = async (saleId) => {
    // ⚡ abrir la ventana antes del primer await (para evitar bloqueos en móviles)
    const printWindow = window.open("", "_blank", "width=400,height=600");

    try {
      // convertir el logo a base64
      const base64Logo = await fetch(logo)
        .then((r) => r.blob())
        .then(
          (b) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(b);
            })
        );

      // obtener la venta
      const sale = await SalesApi.get(saleId);
      if (!sale) {
        toast.error("No se pudo obtener la información de la venta");
        printWindow.close();
        return;
      }

      const total = sale.items?.reduce((acc, i) => acc + i.qty * i.unit_price, 0) || 0;

      const html = `
      <html>
      <head>
          <title>Ticket ${sale.doc_no}</title>
          <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            margin: 0; padding: 10px;
            font-family: monospace; font-size: 12px; color: #000;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .logo { text-align: center; margin-bottom: 6px; }
          .logo img { width: 40%; height: auto; }
          h2, h3, p { text-align: center; margin: 4px 0; }
          hr { border: none; border-top: 1px solid #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { padding: 3px 0; font-size: 12px; vertical-align: middle; }
          th { border-bottom: 1px dashed #000; }
          th:first-child, td:first-child { text-align: left; width: 50%; }
          th:nth-child(2), td:nth-child(2) { text-align: center; width: 15%; }
          th:nth-child(3), td:nth-child(3) { text-align: center; width: 15%; }
          th:last-child, td:last-child { text-align: right; width: 20%; }
          tfoot td { font-weight: bold; border-top: 1px dashed #000; }
          .footer {
            text-align: center;
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 5px;
          }
          </style>
      </head>
      <body>
          <div class="logo">
              <img src="${base64Logo}" alt="Logo" />
          </div>
          <h2>Recibo de Venta</h2>
          <p><b>Folio:</b> ${sale.doc_no}</p>
          <p><b>Sucursal:</b> ${sale.branch_name ?? "—"}</p>
          <p><b>Cliente:</b> ${sale.customer_name || "Público General"}</p>
          <p><b>Fecha:</b> ${new Date(
            new Date(sale.created_at).getTime() - 7 * 60 * 60 * 1000
          ).toLocaleString("es-MX")}</p>
          <hr/>
          <table>
          <thead>
              <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Prec.</th>
              <th>Subtotal</th>
              </tr>
          </thead>
          <tbody>
              ${sale.items
                ?.map(
                  (i) => `
                  <tr>
                  <td>${i.product_name}</td>
                  <td>${Number(i.qty).toFixed(3)}</td>
                  <td>$${Number(i.unit_price).toFixed(2)}</td>
                  <td>$${(i.qty * i.unit_price).toFixed(2)}</td>
                  </tr>`
                )
                .join("")}
          </tbody>
          <tfoot>
              <tr>
              <td colspan="3" style="text-align:right;">TOTAL</td>
              <td>$${total.toFixed(2)}</td>
              </tr>
          </tfoot>
          </table>
          <div class="footer">¡Gracias por su compra!</div>
      </body>
      </html>`;

      // escribir el contenido HTML
      printWindow.document.write(html);
      printWindow.document.close();

      // esperar a que las imágenes se carguen antes de imprimir
      printWindow.onload = () => {
        const imgs = printWindow.document.images;
        if (imgs.length) {
          let loaded = 0;
          for (let img of imgs) {
            img.onload = () => {
              loaded++;
              if (loaded === imgs.length) {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
              }
            };
          }
        } else {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      };
    } catch (error) {
      console.error(error);
      toast.error("Error al imprimir el recibo");
      printWindow.close();
    }
  };

  return { handlePrint };
}
