import { SalesApi } from "../../api";
import { useToast } from "../../utils/toastUtils";
import logo from "../../../public/lechuSnacks.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function useSalePrint() {
  const toast = useToast();

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 📥 DESCARGAR PDF
const handleDownloadPDF = async (saleId) => {
  try {
    const sale = await SalesApi.get(saleId);
    if (!sale) throw new Error("No se pudo obtener la venta");

    const total = sale.items?.reduce((acc, i) => acc + i.qty * i.unit_price, 0) || 0;
    const fechaLocal = new Date(
      new Date(sale.created_at).getTime() - 7 * 60 * 60 * 1000
    ).toLocaleString("es-MX");

    // 🧩 Crear el mismo HTML del ticket (invisible para el usuario)
    const ticket = document.createElement("div");
    ticket.style.width = "80mm";
    ticket.style.padding = "10px";
    ticket.style.fontFamily = "monospace";
    ticket.style.fontSize = "12px";
    ticket.style.background = "white";
    ticket.style.color = "#000";
    ticket.innerHTML = `
      <div style="text-align:center;margin-left:40px;">
        <img src="${logo}" style="width:80%;height:auto;" />
      </div>
      <h2 style="text-align:center;margin:4px 0;">Recibo de Venta</h2>
      <p style="text-align:center;margin:2px 0;"><b>Folio:</b> ${sale.doc_no}</p>
      <p style="text-align:center;margin:2px 0;"><b>Sucursal:</b> ${sale.branch_name ?? "—"}</p>
      <p style="text-align:center;margin:2px 0;"><b>Cliente:</b> ${sale.customer_name || "Público General"}</p>
      <p style="text-align:center;margin:2px 0;"><b>Fecha:</b> ${fechaLocal}</p>
      <hr style="border: none; border-top: 1px solid #000; margin: 6px 0;" />
      <table style="width:100%;border-collapse:separate;border-spacing:0 5px;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px dashed #000;padding-bottom:5px;">Producto</th>
            <th style="text-align:center;border-bottom:1px dashed #000;padding-bottom:5px;">Cant.</th>
            <th style="text-align:center;border-bottom:1px dashed #000;padding-bottom:5px;">Prec.</th>
            <th style="text-align:right;border-bottom:1px dashed #000;padding-bottom:5px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items
            ?.map(
              (i) => `
              <tr>
                <td>${i.product_name}</td>
                <td style="text-align:center;">${Number(i.qty).toFixed(3)}</td>
                <td style="text-align:center;">$${Number(i.unit_price).toFixed(2)}</td>
                <td style="text-align:right;">$${(i.qty * i.unit_price).toFixed(2)}</td>
              </tr>`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"style="text-align:right;font-weight:bold;border-top:1px dashed #000;">TOTAL</td>
            <td style="text-align:right;font-weight:bold;border-top:1px dashed #000;">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align:center;margin-top:10px;border-top:1px dashed #000;padding-top:5px;">
        ¡Gracias por su compra!
      </div>
    `;

    // Agregarlo al DOM temporalmente
    document.body.appendChild(ticket);

    // 🖼️ Convertir el HTML a imagen
    const canvas = await html2canvas(ticket, {
      scale: 3, // más nitidez
      useCORS: true, // necesario si el logo viene de archivo local
    });

    const imgData = canvas.toDataURL("image/png");

    // 🧾 Crear PDF con tamaño dinámico (misma proporción que el ticket)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, (canvas.height * 80) / canvas.width],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 80, (canvas.height * 80) / canvas.width);
    pdf.save(`Ticket_${sale.doc_no}.pdf`);

    // Eliminar el HTML temporal
    document.body.removeChild(ticket);

    toast.success("PDF descargado correctamente");
  } catch (err) {
    console.error(err);
    toast.error("Error al generar PDF");
  }
};

  return {  handleDownloadPDF };
}
