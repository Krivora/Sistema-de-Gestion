"use client"
import { ThemeToggle } from "./theme-toggle"
import { useAuthStore } from "@/store/auth.store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MobileMenuButton } from "./mobile-menu-button"
import { Breadcrumbs } from "./breadcrumbs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function Topbar() {
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)
    const router = useRouter()
    const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "U"

    function handleLogout() {
        logout()
        router.push("/login")
    }

    return (
        <header className="h-14 border-b flex items-center justify-between px-4 gap-3 bg-background shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5">
                            <p className="font-medium text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate font-normal">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            <LogOut size={14} className="mr-2" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}