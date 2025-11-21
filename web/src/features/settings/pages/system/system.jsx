// src/features/settings/pages/SystemSettings.jsx
import { useState, useEffect } from "react";
import PageHeader from "@core/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Divider,
  Avatar,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useSystemSettings } from "@features/settings/hooks/useSystemSettings";
import { fileUrl } from "@core/utils/images/buildFileUrl";

export default function SystemSettings() {
  const { settings, loading, update, uploadLogo } = useSystemSettings();

  const [businessName, setBusinessName] = useState("");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name || "");
      setPreview(
        settings.logo_url ? fileUrl(settings.logo_url) : "/placeholder-logo.png"
      );
    }
  }, [settings]);

  // Al seleccionar un archivo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogo(file);
    setPreview(URL.createObjectURL(file)); // 🎯 preview inmediata
  };

  const handleSubmit = async () => {
    let finalLogoUrl = settings?.logo_url || "";

    // Si hay archivo nuevo, subirlo
    if (logo) {
      finalLogoUrl = await uploadLogo(logo);
    }

    await update({
      business_name: businessName,
      logo_url: finalLogoUrl,
    });
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Configuración del Sistema"
        description="Ajusta la información principal del negocio y su identidad visual."
        breadcrumbs={[
          { label: "Configuración", to: "/config" },
          { label: "Sistema" },
        ]}
      />

      <Card className="rounded-2xl shadow-md">
        <CardHeader
          title="Identidad del Negocio"
          subheader="Nombre y logotipo visibles en todas las secciones del sistema."
        />

        <Divider />

        <CardContent className="space-y-8 pt-6">

          {/* Nombre */}
          <div className="space-y-2">
            <label className="font-medium text-sm">Nombre del Negocio</label>
            <TextField
              fullWidth
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <label className="font-medium text-sm">Logo del Negocio</label>

            <div className="flex items-center gap-6">

              {/* Preview */}
              <Avatar
                variant="rounded"
                src={preview}
                sx={{ width: 96, height: 96 }}
                className="border border-gray-300"
              />

              {/* Botón subir */}
              <div>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  className="rounded-xl"
                >
                  Subir logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleLogoChange}
                  />
                </Button>

                <p className="text-xs text-gray-500 mt-2">
                  Recomendado: PNG transparente — 500x500px
                </p>
              </div>

            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outlined" className="rounded-lg">
              Cancelar
            </Button>

            <Button
              variant="contained"
              className="rounded-lg"
              onClick={handleSubmit}
            >
              Guardar cambios
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
