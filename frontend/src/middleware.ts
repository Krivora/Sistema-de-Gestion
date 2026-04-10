import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC = ["/login"]

// Rutas exclusivas de superadmin
const SUPERADMIN_ONLY = ["/dashboard/clients", "/dashboard/roles"]

// Rutas exclusivas de admin+
const ADMIN_ONLY = [
  "/dashboard/users",
  "/dashboard/branches",
  "/dashboard/activities",
]
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get("inv_token")?.value
  const role = req.cookies.get("inv_role")?.value

  // Sin token → login
  if (!token) return NextResponse.redirect(new URL("/login", req.url))

  if (SUPERADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (role !== "superadmin") return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}
export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
}