"use client"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { useNewPurchase } from "@/features/purchases/hooks/use-new-purchase"
import { PurchaseDetailsPanel } from "@/features/purchases/components/purchase-details-panel"
import { PurchaseSummaryPanel } from "@/features/purchases/components/purchase-summary-panel"
import { PurchaseCartPanel } from "@/features/purchases/components/purchase-cart-panel"

export default function NewPurchasePage() {
    const user = useAuthStore((s) => s.user)
    const p = useNewPurchase()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/purchases" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft size={16} />Compras
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="text-xl font-semibold">Nueva compra</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-5">
                    <PurchaseDetailsPanel
                        branches={p.branches}
                        suppliers={p.suppliers}
                        branchId={p.branchId}
                        supplierId={p.supplierId}
                        docNo={p.docNo}
                        selectedBranch={p.selectedBranch}
                        selectedSupplier={p.selectedSupplier}
                        disableBranch={!!user?.branch_id}
                        onBranchChange={(v) => { p.setBranchId(v ?? ""); p.cart.forEach(c => p.removeFromCart(c.product_id)) }}
                        onSupplierChange={(v) => p.setSupplierId(v ?? "")}
                        onDocNoChange={p.setDocNo}
                    />
                    <PurchaseSummaryPanel
                        cart={p.cart}
                        subtotal={p.subtotal}
                        canSubmit={p.canSubmit}
                        loading={p.loading}
                        branchId={p.branchId}
                        onSubmit={p.handleSubmit}
                    />
                </div>
                <div className="lg:col-span-2">
                    <PurchaseCartPanel
                        searchRef={p.searchRef as React.RefObject<HTMLDivElement>}
                        branchId={p.branchId}
                        loadingProducts={p.loadingProducts}
                        productSearch={p.productSearch}
                        searchOpen={p.searchOpen}
                        filteredProducts={p.filteredProducts}
                        cart={p.cart}
                        subtotal={p.subtotal}
                        onSearchChange={p.setProductSearch}
                        onSearchOpen={p.setSearchOpen}
                        onAddToCart={p.addToCart}
                        onUpdateCart={p.updateCart}
                        onRemoveFromCart={p.removeFromCart}
                    />
                </div>
            </div>
        </div>
    )
}