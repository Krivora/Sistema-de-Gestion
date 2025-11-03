import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  Typography,
  Link as MuiLink,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
} from "@mui/material";
import {
  ListAlt,
  Category,
  CompareArrows,
} from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";

export default function Catalogs() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const catalogs = [
    {
      title: "Motivos de Ajuste",
      description: "Define los motivos predefinidos para ajustes de inventario.",
      icon: <ListAlt fontSize="large" />,
      onClick: () => navigate("/settings/catalogs/adjustment-notes"),
    },
    {
      title: "Motivos de Transacción",
      description: "Consulta y administra los tipos de movimiento de inventario.",
      icon: <CompareArrows fontSize="large" />,
      onClick: () => navigate("/settings/catalogs/transfer-reasons"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" className="text-sm">
        <MuiLink
          underline="hover"
          color={darkMode ? "gray.300" : "inherit"}
          onClick={() => navigate("/dashboard")}
          sx={{ cursor: "pointer" }}
        >
          Inicio
        </MuiLink>
        <MuiLink
          underline="hover"
          color={darkMode ? "gray.300" : "inherit"}
          onClick={() => navigate("/config")}
          sx={{ cursor: "pointer" }}
        >
          Configuración
        </MuiLink>
        <Typography color="text.primary">Catálogos</Typography>
      </Breadcrumbs>

      {/* 🔹 Encabezado */}
      <div className="flex flex-col gap-1">
        <Typography variant="h5" fontWeight={600}>
          Catálogos del Sistema
        </Typography>
        <Typography
          variant="body2"
          color={darkMode ? "gray.400" : "text.secondary"}
        >
          Administra los catálogos utilizados por los módulos del sistema.
        </Typography>
      </div>

      {/* 🔹 Grid de Catálogos */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
        sx={{ mt: 1 }}
      >
        {catalogs.map((cat, index) => (
          <Grid
            item
            key={index}
            xs={12}
            sm={6}
            md={4}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card
              onClick={cat.onClick}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-[#1c1c1c] text-gray-200"
                  : "bg-white text-gray-800"
              }`}
              sx={{
                borderRadius: 3,
                width: "100%",
                maxWidth: 350,
                height: "100%",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: 1,
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: darkMode ? "#2e2e2e" : "#f3f4f6",
                    mb: 2,
                    mx: "auto",
                  }}
                >
                  <IconButton color="primary">{cat.icon}</IconButton>
                </Box>

                <Typography
                  variant="h6"
                  align="center"
                  fontWeight={600}
                  gutterBottom
                >
                  {cat.title}
                </Typography>

                <Typography
                  variant="body2"
                  align="center"
                  color={darkMode ? "gray.400" : "text.secondary"}
                >
                  {cat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
