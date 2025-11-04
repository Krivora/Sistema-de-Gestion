import { Breadcrumbs, Typography, Link as MuiLink } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@core/context/ThemeProvider";

/**
 * Componente reutilizable para encabezados con breadcrumbs y descripción
 *
 * @param {string} title - Título principal de la página
 * @param {string} description - Descripción corta o propósito del módulo
 * @param {Array<{ label: string, to?: string }>} breadcrumbs - Lista de rutas previas (opcional)
 */
export default function PageHeader({ title, description, breadcrumbs = [] }) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <div className="space-y-3 mb-3">
      {/* 🔹 Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" className="text-sm">
        {/* Enlace a inicio */}
        <MuiLink
          underline="hover"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Inicio
        </MuiLink>

        {/* Resto de migas dinámicas */}
        {breadcrumbs.map((crumb, index) =>
          crumb.to ? (
            <MuiLink
              key={index}
              underline="hover"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(crumb.to)}
            >
              {crumb.label}
            </MuiLink>
          ) : (
            <Typography key={index} color="text.primary">
              {crumb.label}
            </Typography>
          )
        )}

        {/* Si no hay migas adicionales, muestra solo el título */}
        {breadcrumbs.length === 0 && (
          <Typography color="text.primary">{title}</Typography>
        )}
      </Breadcrumbs>

      {/* 🔹 Encabezado */}
      <div>
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color={darkMode ? "gray.400" : "text.secondary"}
        >
          {description}
        </Typography>
      </div>
    </div>
  );
}
