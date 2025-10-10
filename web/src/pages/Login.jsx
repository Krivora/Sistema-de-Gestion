import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { darkMode } = useTheme();
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const ok = await handleLogin(email, password);
    if (ok) navigate("/");
    else setError("Credenciales inválidas");
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: darkMode ? "#121212" : "#f0f2f5",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          textAlign: "center",
          bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
        }}
      >
        {/* Título principal */}
        <Typography
          variant="h4"
          fontWeight="bold"
          color={darkMode ? "primary.light" : "primary.main"}
        >
          Bienvenido
        </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 500, mt: 1, mb: 3 }}
          color={darkMode ? "grey.300" : "text.secondary"}
        >
          Lechu'Snacks
        </Typography>

        <form onSubmit={onSubmit}>
          <TextField
            label="Correo electrónico"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <Typography color="error" fontSize={14} mt={1}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.4,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              borderRadius: 2,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar sesión"}
          </Button>
        </form>

        {/* Pie de página */}
        <Typography
          variant="body2"
          sx={{
            mt: 4,
            color: darkMode ? "grey.500" : "text.secondary",
          }}
        >
          © {new Date().getFullYear()} Lechu'Snacks — Todos los derechos reservados
        </Typography>
      </Paper>
    </Box>
  );
}
