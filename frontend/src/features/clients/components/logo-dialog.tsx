"use client"
import { useRef, useState } from "react"
import { clientsApi, type Client } from "@/lib/api/clients"
import { sileo } from "sileo"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    client: Client | null
    onSuccess: () => void
}

export function LogoDialog({ open, onClose, client, onSuccess }: Props) {
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
    }

    async function handleUpload() {
        if (!file || !client) return
        setLoading(true)
        try {
            await clientsApi.uploadLogo(client.id, file)
            sileo.success({ title: "Logo actualizado" })
            onSuccess()
        } catch {
            sileo.error({ title: "Error al subir logo" })
        } finally {
            setLoading(false)
        }
    }

    function handleClose() {
        setPreview(null)
        setFile(null)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Logo de {client?.name}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-2">
                    <Avatar className="h-24 w-24">
                        {(preview || client?.logo_url) && (
                            <AvatarImage src={preview ?? client?.logo_url} alt="Logo" />
                        )}
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                            {client?.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-muted-foreground/40 hover:border-primary hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                    >
                        <Upload size={16} />
                        {file ? file.name : "Seleccionar imagen"}
                    </button>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleUpload} disabled={!file || loading}>
                        {loading ? "Subiendo..." : "Guardar logo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}