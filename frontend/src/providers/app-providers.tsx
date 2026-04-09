"use client"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sileo"

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-right" theme="system" />
        </ThemeProvider>
    )
}