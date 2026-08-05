"use client"
import { use } from "react"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { useNewSale } from "@/features/sales/hooks/use-new-sale"
import { SaleDetailsPanel } from "@/features/sales/components/sale-details-panel"
import { SaleCustomerPanel } from "@/features/sales/components/sale-customer-panel"
import { SaleSummaryPanel } from "@/features/sales/components/sale-summary-panel"
import { SaleCartPanel } from "@/features/sales/components/sale-cart-panel"

export default function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const user = useAuthStore((s) => s.user)
    const sale = useNewSale(Number(id))

    const handleBranchChange = (v: string | null) => {
        if (v) {
            sale.setBranchId(v)
            if (sale.cart.length) {
                sale.cart.forEach(c => sale.removeFromCart(c.product_id))
            }
        }
    }

    if (sale.loadingSale) {
        return (
            <div className="space-y-6">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-5">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 border rounded-lg bg-muted/30 animate-pulse" />
                        ))}
                    </div>
                    <div className="lg:col-span-2">
                        <div className="h-96 border rounded-lg bg-muted/30 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/sales" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft size={16} />Ventas
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="text-xl font-semibold">
                    Editar venta {sale.docNo && <span className="font-mono text-muted-foreground">{sale.docNo}</span>}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-5">
                    <SaleDetailsPanel
                        branches={sale.branches}
                        branchId={sale.branchId}
                        paymentMethod={sale.paymentMethod}
                        docNo={sale.docNo}
                        disableBranch={!!user?.branch_id}
                        onBranchChange={handleBranchChange}
                        onPaymentChange={(v) => v && sale.setPaymentMethod(v)}
                        onDocNoChange={sale.setDocNo}
                    />
                    <SaleCustomerPanel
                        customerSearchRef={sale.customerSearchRef as React.RefObject<HTMLDivElement>}
                        customerId={sale.customerId}
                        customerName={sale.customerName}
                        customerPhone={sale.customerPhone}
                        customerSearch={sale.customerSearch}
                        customerSearchOpen={sale.customerSearchOpen}
                        filteredCustomers={sale.filteredCustomers}
                        onSearchChange={sale.setCustomerSearch}
                        onSearchOpenChange={sale.setCustomerSearchOpen}
                        onSelectCustomer={sale.selectCustomer}
                        onClear={sale.clearCustomer}
                        onNameChange={sale.setCustomerName}
                        onPhoneChange={sale.setCustomerPhone}
                    />
                    <SaleSummaryPanel
                        cart={sale.cart}
                        subtotal={sale.subtotal}
                        paymentMethod={sale.paymentMethod}
                        stockWarnings={sale.stockWarnings}
                        canSubmit={sale.canSubmit}
                        loading={sale.loading}
                        branchId={sale.branchId}
                        isEdit
                        paymentType={sale.paymentType}
                        onSubmitOpen={sale.handleSubmitOpen}
                        onSubmitPost={sale.handleSubmitPost}
                    />
                </div>
                <div className="lg:col-span-2">
                    <SaleCartPanel
                        searchRef={sale.searchRef as React.RefObject<HTMLDivElement>}
                        branchId={sale.branchId}
                        loadingProducts={sale.loadingProducts}
                        productSearch={sale.productSearch}
                        searchOpen={sale.searchOpen}
                        filteredProducts={sale.filteredProducts}
                        cart={sale.cart}
                        subtotal={sale.subtotal}
                        onSearchChange={sale.setProductSearch}
                        onSearchOpen={sale.setSearchOpen}
                        onAddToCart={sale.addToCart}
                        onUpdateCart={sale.updateCart}
                        onRemoveFromCart={sale.removeFromCart}
                        barcode={sale.barcode}
                        scannerRef={sale.scannerRef}
                        onBarcodeChange={sale.setBarcode}
                        onBarcodeScan={sale.handleBarcodeScan}
                    />
                </div>
            </div>
        </div>
    )
}
