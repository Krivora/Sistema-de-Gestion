import jsPDF from "jspdf"
import autoTable, { type RowInput } from "jspdf-autotable"
import { groupSaleLines, type Sale, PAYMENT_METHODS } from "@/lib/api/sales"
import { API_URL } from "@/lib/constants"

// ─────────────────────────────────────────────────────────────
// 🎨 Paleta de Colores (Estilo AWS / Tesla / Stripe)
// ─────────────────────────────────────────────────────────────
const COLORS = {
    primary: [17, 24, 39] as [number, number, number],   // Gris oscuro
    secondary: [107, 114, 128] as [number, number, number],
    accent: [0, 102, 204] as [number, number, number],   // Azul corporativo
    light: [249, 250, 251] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
}

// ─────────────────────────────────────────────────────────────
// 🧰 Utilidades
// ─────────────────────────────────────────────────────────────
function fmt(n: number) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(n)
}

/** Cantidades sin ceros de relleno: "3.0000" -> "3", "1.5000" -> "1.5" */
function fmtQty(n: number) {
    return String(Number(n))
}

function fmtDate(iso: string) {
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(iso))
}

async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const fullUrl = url.startsWith("http")
            ? url
            : `${API_URL.replace("/api", "")}${url}`

        const res = await fetch(fullUrl)
        const blob = await res.blob()

        return await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

// ─────────────────────────────────────────────────────────────
// ⚙️ Opciones del Recibo
// ─────────────────────────────────────────────────────────────
export interface ReceiptOptions {
    businessName: string
    logoUrl?: string
    address?: string
    phone?: string
    email?: string
    website?: string
    accentColor?: [number, number, number]
}

// ─────────────────────────────────────────────────────────────
// 🧾 Generador de Recibo Premium
// ─────────────────────────────────────────────────────────────
export async function generateSaleReceipt(
    sale: Sale,
    opts: ReceiptOptions
): Promise<void> {
    const doc = new jsPDF({
        unit: "mm",
        format: "a4",
    })

    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const M = 20
    let y = M

    const accent = opts.accentColor ?? COLORS.accent

    // ── HEADER PREMIUM ───────────────────────────────────────────
    const logoBase64 = opts.logoUrl
        ? await loadImageAsBase64(opts.logoUrl)
        : null

    const headerTop = y
    const headerHeight = 26

    // Definir columnas
    const leftX = M
    const centerX = W / 2
    const rightX = W - M

    // ── Logo (Izquierda) ─────────────────────────────────────────
    if (logoBase64) {
        const logoWidth = 40
        const logoHeight = 30
        const logoY = headerTop + (headerHeight - logoHeight) / 2
        doc.addImage(logoBase64, "PNG", leftX, logoY, logoWidth, logoHeight, undefined, "FAST")
    }

    // ── Información del Negocio (Centro) ─────────────────────────
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(...COLORS.primary)
    doc.text(opts.businessName, centerX, headerTop + 8, {
        align: "center",
        maxWidth: 80,
    })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)

    let infoY = headerTop + 13
    const contactInfo: string[] = []

    if (opts.address) contactInfo.push(opts.address)
    if (opts.phone) contactInfo.push(`Tel: ${opts.phone}`)
    if (opts.email) contactInfo.push(`Email: ${opts.email}`)
    if (opts.website) contactInfo.push(opts.website)

    // Imprimir líneas centradas
    contactInfo.slice(0, 3).forEach((line) => {
        doc.text(line, centerX, infoY, {
            align: "center",
            maxWidth: 90,
        })
        infoY += 4
    })

    // ── Información del Documento (Derecha) ──────────────────────
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    doc.text("RECIBO DE VENTA", rightX, headerTop + 5, {
        align: "right",
    })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(...COLORS.primary)
    doc.text(sale.doc_no, rightX, headerTop + 12, {
        align: "right",
    })

    // ── Línea divisoria elegante ─────────────────────────────────
    y += headerHeight

    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.5)
    doc.line(M, y, W - M, y)

    y += 8

    // ─────────────────────────────────────────────────────────
    // INFORMACIÓN GENERAL
    // ─────────────────────────────────────────────────────────
    const paymentMethod =
        PAYMENT_METHODS.find(
            (m) => m.value === sale.payment_method
        )?.label ?? sale.payment_method

    const infoRows = [
        ["Fecha", fmtDate(sale.created_at)],
        ["Método de Pago", paymentMethod],
        ["Atendió", sale.user_name],
        ["Sucursal", `${sale.branch_name} (${sale.branch_code})`],
    ]

    autoTable(doc, {
        startY: y,
        theme: "plain",
        margin: { left: M, right: M },
        body: infoRows,
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 2,
            textColor: COLORS.primary,
        },
        columnStyles: {
            0: { fontStyle: "bold", textColor: COLORS.secondary, cellWidth: 45 },
            1: { cellWidth: "auto" },
        },
    })

    y = (doc as any).lastAutoTable.finalY + 6

    // ─────────────────────────────────────────────────────────
    // CLIENTE
    // ─────────────────────────────────────────────────────────
    if (sale.customer_name || sale.customer_phone) {
        doc.setFillColor(...COLORS.light)
        doc.setDrawColor(...COLORS.border)
        doc.roundedRect(M, y, W - M * 2, 14, 2, 2, "FD")

        doc.setFillColor(...accent)
        doc.rect(M, y, 3, 14, "F")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(...COLORS.primary)
        doc.text("Cliente", M + 6, y + 6)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.text(
            `${sale.customer_name ?? "Público en General"} ${sale.customer_phone ? "· " + sale.customer_phone : ""
            }`,
            M + 6,
            y + 11
        )

        y += 20
    }

    // ─────────────────────────────────────────────────────────
    // TABLA DE PRODUCTOS
    // ─────────────────────────────────────────────────────────
    // El paquete se cobra completo: encabeza con su precio y debajo van sus
    // productos solo con la cantidad. Poner ahí el precio prorrateado de cada
    // pieza confundiría al cliente, que pagó por el paquete.
    const { packages, loose } = groupSaleLines(sale)

    const body: RowInput[] = []

    for (const { pkg, items } of packages) {
        body.push([
            { content: pkg.name, styles: { fontStyle: "bold" } },
            fmtQty(pkg.qty),
            fmt(pkg.unit_price),
            fmt(pkg.total),
        ])
        for (const item of items) {
            body.push([
                { content: `    ${item.product_name}`, styles: { textColor: COLORS.secondary } },
                { content: fmtQty(item.qty), styles: { textColor: COLORS.secondary } },
                "",
                "",
            ])
        }
    }

    for (const item of loose) {
        body.push([
            item.product_name,
            fmtQty(item.qty),
            fmt(item.unit_price),
            fmt(item.qty * item.unit_price),
        ])
    }

    autoTable(doc, {
        startY: y,
        margin: { left: M, right: M },
        tableWidth: W - M * 2,
        head: [["Producto", "Cant.", "Precio", "Importe"]],
        body,
        theme: "plain",
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
            textColor: COLORS.primary,
            overflow: "linebreak",
            valign: "middle",
            halign: "left", // Alineación por defecto
        },
        headStyles: {
            fontStyle: "bold",
            fontSize: 9,
            textColor: COLORS.secondary,
            fillColor: false,
            halign: "left",
            valign: "middle",
        },
        columnStyles: {
            0: { cellWidth: "auto", halign: "left" },   // Producto
            1: { cellWidth: 20, halign: "center" },     // Cantidad
            2: { cellWidth: 30, halign: "right" },      // Precio
            3: { cellWidth: 35, halign: "right", fontStyle: "bold" }, // Importe
        },
        didParseCell: (data) => {
            // Garantiza que el encabezado tenga la misma alineación
            if (data.section === "head") {
                if (data.column.index === 1) data.cell.styles.halign = "center";
                if (data.column.index === 2 || data.column.index === 3) {
                    data.cell.styles.halign = "right";
                }
            }
        },
        didDrawCell: (data) => {
            if (data.section === "body") {
                doc.setDrawColor(...COLORS.border);
                doc.setLineWidth(0.2);
                doc.line(
                    data.cell.x,
                    data.cell.y + data.cell.height,
                    data.cell.x + data.cell.width,
                    data.cell.y + data.cell.height
                );
            }
        },
    });

    y = (doc as any).lastAutoTable.finalY + 10

    // ─────────────────────────────────────────────────────────
    // RESUMEN DE TOTALES
    // ─────────────────────────────────────────────────────────
    const boxWidth = 70
    const x = W - M - boxWidth

    doc.setFillColor(...COLORS.light)
    doc.setDrawColor(...COLORS.border)
    doc.roundedRect(x, y, boxWidth, 22, 2, 2, "FD")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.secondary)
    doc.text("Subtotal", x + 5, y + 8)
    doc.text(fmt(sale.subtotal), x + boxWidth - 5, y + 8, { align: "right" })

    doc.setDrawColor(...COLORS.border)
    doc.line(x + 5, y + 11, x + boxWidth - 5, y + 11)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(...COLORS.primary)
    doc.text("Total", x + 5, y + 18)
    doc.text(fmt(sale.total), x + boxWidth - 5, y + 18, {
        align: "right",
    })

    y += 30

    // ─────────────────────────────────────────────────────────
    // RESUMEN DE PRODUCTOS
    // ─────────────────────────────────────────────────────────
    const totalUnits = (sale.items ?? []).reduce((sum, i) => sum + Number(i.qty), 0)

    const summary = [
        packages.length ? `${packages.length} paquete(s)` : null,
        loose.length ? `${loose.length} producto(s)` : null,
        `${fmtQty(totalUnits)} unidad(es)`,
    ].filter(Boolean).join(" · ")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.secondary)
    doc.text(summary, M, y)

    // ─────────────────────────────────────────────────────────
    // FOOTER
    // ─────────────────────────────────────────────────────────
    const footerY = H - 15

    doc.setDrawColor(...COLORS.border)
    doc.line(M, footerY, W - M, footerY)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.secondary)

    doc.text("Gracias por su compra.", W / 2, footerY + 5, {
        align: "center",
    })

    doc.text(
        `Documento interno · Folio ${sale.doc_no}`,
        W / 2,
        footerY + 10,
        { align: "center" }
    )

    // ─────────────────────────────────────────────────────────
    // EXPORTAR PDF
    // ─────────────────────────────────────────────────────────
    doc.save(`recibo-${sale.doc_no}.pdf`)
}