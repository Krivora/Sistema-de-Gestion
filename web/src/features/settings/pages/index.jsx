import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import {
  Security,
  Shield,
  Folder,
  SettingsApplications,
  Groups,
  Key,
} from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";
import PageHeader from "@core/components/common/PageHeader";

export default function UserSettings() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const cards = [
    {
      title: "Sistema",
      description:
        "Configura Nombre del sistema, logotipos y otros ajustes generales.",
      icon: <SettingsApplications fontSize="large" />,
      onClick: () => navigate("/settings/system"),
    },
    {
      title: "Roles",
      description: "Gestiona los roles de usuario y sus niveles de acceso.",
      icon: <Groups fontSize="large" />,
      onClick: () => navigate("/settings/roles"),
    },
    {
      title: "Permisos",
      description:
        "Define qué acciones puede realizar cada rol dentro del sistema.",
      icon: <Key fontSize="large" />,
      onClick: () => navigate("/settings/permissions"),
    },
    {
      title: "Catálogos",
      description:
        "Administra los catálogos del sistema como motivos, tipos o clasificaciones.",
      icon: <Folder fontSize="large" />,
      onClick: () => navigate("/settings/catalogs"),
    },
    {
      title: "Auditoría",
      description:
        "Consulta registros de actividad y auditorías del sistema.",
      icon: <Shield fontSize="large" />,
      onClick: () => navigate("/settings/audit"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title=" Configuración del Sistema"
        description="Administra roles, permisos y catálogos generales del sistema."
        breadcrumbs={[
          { label: "Configuración"},
        ]}
      />
      {/* 🔹 Grid de Cards */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
        sx={{ mt: 1 }}
      >
        {cards.map((card, index) => (
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
              onClick={card.onClick}
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
                  <IconButton color="primary">{card.icon}</IconButton>
                </Box>

                <Typography
                  variant="h6"
                  align="center"
                  fontWeight={600}
                  gutterBottom
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  align="center"
                  color={darkMode ? "gray.400" : "text.secondary"}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
