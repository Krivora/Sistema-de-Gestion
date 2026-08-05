import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { type Sale, type SalePayment, PAYMENT_METHODS } from "@/lib/api/sales"
import { API_URL } from "@/lib/constants"
import type { ReceiptOptions } from "./sale-receipt"

const COLORS = {
    primary: [17, 24, 39] as [number, number, number],
    secondary: [107, 114, 128] as [number, number, number],
    accent: [0, 102, 204] as [number, number, number],
    light: [249, 250, 251] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
    success: [22, 101, 52] as [number, number, number],
    danger: [185, 28, 28] as [number, number, number],
}

function fmt(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

function fmtDate(iso: string) {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso))
}

async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const fullUrl = url.startsWith("http") ? url : `${API_URL.replace("/api", "")}${url}`
        const res = await fetch(fullUrl)
        if (!res.ok) return null
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

function methodLabel(value: string) {
    return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value
}

/**
 * Comprobante de un abono.
 *
 * `payments` es el historial completo para que el cliente vea cómo va su cuenta,
 * y `payment` el abono que se está comprobando — se resalta en la tabla.
 */
export async function generatePaymentReceipt(
    sale: Sale,
    payment: SalePayment,
    payments: SalePayment[],
    opts: ReceiptOptions
): Promise<void> {
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const W = doc.internal.pageSize.getWidth()
    const M = 20
    let y = M

    const accent = opts.accentColor ?? COLORS.accent
    const logoBase64 = opts.logoUrl ? await loadImageAsBase64(opts.logoUrl) : null

    // ── Encabezado ───────────────────────────────────────────────
    if (logoBase64) {
        doc.addImage(logoBase64, "PNG", M, y - 2, 34, 26, undefined, "FAST")
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(...COLORS.primary)
    doc.text(opts.businessName, W / 2, y + 6, { align: "center", maxWidth: 80 })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    let infoY = y + 11
    for (const line of [opts.address, opts.phone && `Tel: ${opts.phone}`, opts.email].filter(Boolean).slice(0, 3)) {
        doc.text(String(line), W / 2, infoY, { align: "center", maxWidth: 90 })
        infoY += 4
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...accent)
    doc.text("COMPROBANTE DE ABONO", W - M, y + 4, { align: "right" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    doc.text(`Recibo #${payment.id}`, W - M, y + 9, { align: "right" })
    doc.text(`Venta ${sale.doc_no}`, W - M, y + 13, { align: "right" })
    doc.text(fmtDate(payment.paid_at), W - M, y + 17, { align: "right" })

    y += 30
    doc.setDrawColor(...COLORS.border)
    doc.line(M, y, W - M, y)
    y += 8

    // ── Cliente y sucursal ───────────────────────────────────────
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.primary)
    doc.text("RECIBIMOS DE", M, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.secondary)
    doc.text(sale.customer_name || "Público en general", M, y + 5)
    if (sale.customer_phone) doc.text(sale.customer_phone, M, y + 9)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.primary)
    doc.text("SUCURSAL", W / 2, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.secondary)
    doc.text(sale.branch_name ?? "—", W / 2, y + 5)

    y += 18

    // ── Monto recibido, en grande ────────────────────────────────
    doc.setFillColor(...COLORS.light)
    doc.setDrawColor(...COLORS.border)
    doc.roundedRect(M, y, W - M * 2, 24, 2, 2, "FD")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    doc.text("MONTO DE ESTE ABONO", M + 6, y + 8)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(...accent)
    doc.text(fmt(payment.amount), M + 6, y + 18)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    doc.text(`Forma de pago: ${methodLabel(payment.method)}`, W - M - 6, y + 8, { align: "right" })
    if (payment.note) {
        doc.text(String(payment.note).slice(0, 40), W - M - 6, y + 13, { align: "right" })
    }

    y += 32

    // ── Estado de cuenta ─────────────────────────────────────────
    const saldado = sale.balance <= 0.009

    autoTable(doc, {
        startY: y,
        head: [["Concepto", "Importe"]],
        body: [
            ["Total de la venta", fmt(sale.total)],
            ["Abonado hasta hoy", fmt(sale.paid_amount)],
            [saldado ? "Saldo — LIQUIDADO" : "Saldo pendiente", fmt(sale.balance)],
        ],
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fontStyle: "bold", textColor: COLORS.primary, fillColor: COLORS.light },
        columnStyles: { 1: { halign: "right" } },
        didParseCell: (data) => {
            if (data.section === "body" && data.row.index === 2) {
                data.cell.styles.fontStyle = "bold"
                data.cell.styles.textColor = saldado ? COLORS.success : COLORS.danger
            }
        },
    })

    // @ts-expect-error lastAutoTable lo agrega el plugin en tiempo de ejecución
    y = (doc.lastAutoTable?.finalY ?? y) + 10

    // ── Historial de abonos ──────────────────────────────────────
    if (payments.length > 1) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(...COLORS.primary)
        doc.text("HISTORIAL DE ABONOS", M, y)
        y += 4

        autoTable(doc, {
            startY: y,
            head: [["#", "Fecha", "Forma de pago", "Importe"]],
            body: payments.map((p, i) => [
                String(i + 1),
                fmtDate(p.paid_at),
                methodLabel(p.method),
                fmt(p.amount),
            ]),
            theme: "striped",
            styles: { fontSize: 9, cellPadding: 2.5 },
            headStyles: { fillColor: COLORS.light, textColor: COLORS.primary, fontStyle: "bold" },
            columnStyles: { 0: { cellWidth: 12 }, 3: { halign: "right" } },
            // Resalta el abono de este comprobante
            didParseCell: (data) => {
                if (data.section === "body" && payments[data.row.index]?.id === payment.id) {
                    data.cell.styles.fontStyle = "bold"
                    data.cell.styles.textColor = COLORS.primary
                }
            },
        })

        // @ts-expect-error igual que arriba
        y = (doc.lastAutoTable?.finalY ?? y) + 12
    }

    // ── Firma ────────────────────────────────────────────────────
    if (y < doc.internal.pageSize.getHeight() - 40) {
        doc.setDrawColor(...COLORS.border)
        doc.line(W / 2 + 10, y + 14, W - M, y + 14)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(...COLORS.secondary)
        doc.text("Recibí conforme", W / 2 + 10, y + 18)
    }

    doc.save(`abono-${sale.doc_no}-${payment.id}.pdf`)
}
