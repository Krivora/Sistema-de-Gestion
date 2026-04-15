"use client"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { useNewSale } from "@/features/sales/hooks/use-new-sale"
import { SaleDetailsPanel } from "@/features/sales/components/sale-details-panel"
import { SaleCustomerPanel } from "@/features/sales/components/sale-customer-panel"
import { SaleSummaryPanel } from "@/features/sales/components/sale-summary-panel"
import { SaleCartPanel } from "@/features/sales/components/sale-cart-panel"

export default function NewSalePage() {
    const user = useAuthStore((s) => s.user)
    const sale = useNewSale()


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/sales" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft size={16} />Ventas
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="text-xl font-semibold">Nueva venta</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-5">
                    <SaleDetailsPanel
                        branches={sale.branches}
                        branchId={sale.branchId}
                        paymentMethod={sale.paymentMethod}
                        docNo={sale.docNo}
                        disableBranch={!!user?.branch_id}
                        onBranchChange={(v) => { sale.setBranchId(v); sale.cart.length && sale.cart.forEach(c => sale.removeFromCart(c.product_id)) }}
                        onPaymentChange={sale.setPaymentMethod}
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
                    />
                </div>
            </div>
        </div>
    )
}