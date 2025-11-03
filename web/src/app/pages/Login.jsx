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
import { useTheme } from "@core/context/ThemeProvider";
import { useAuth } from "@core/context/AuthProvider";

export default function Login() {
  const { darkMode } = useTheme();
  const { login, loading } = useAuth(); // 👈 login viene de AuthProvider
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password); // 👈 usa la función del AuthProvider
      navigate("/"); // redirige al dashboard principal
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: darkMode ? "#121212" : "#f0f2f5",
        p: { xs: 2, sm: 6, md: 10, lg: 10 },
        position: "relative",
        backgroundImage: `url('/FondoLogin.webp')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, #3F29BA 0%, rgba(63,41,186,0) 100%)",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Contenedor central */}
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: '100%', lg: 3000, xl: 2300 }, 
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, 
          alignItems: "stretch",
          position: "relative",
          zIndex: 1, 
        }}
      >
        
        <Box
          sx={{
            width: { xs: "100%", md: "40%" },   
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            p: { xs: 4, md: 0},     
            pl: { md: 0 },           
            pr: { md: 2 },          
            color: "#fff",
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem", lg: "4rem" },
                color: "#FFFFFF",
                textShadow: "0 6px 18px rgba(0,0,0,0.35)",
              }}
            >
              ¡Bienvenido <br />
              De Nuevo a Inventra!
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: "500",
                color: "rgba(255,255,255,0.9)",
                mb: 2,
                lineHeight: 1.3,
              }}
            >
              Optimiza cada sucursal <br /> y  Conecta todo tu <br /> negocio.
            </Typography>
          </Box>
        </Box>

        {/* login */}
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 4, md: 30 }, 
            pr: { md: 0 }, 
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 8,              
              width: "100%",
              maxWidth: 500,     
              borderRadius: 4,
              minHeight: { xs: "400px", sm: "500px", md: "600px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              bgcolor: "rgba(255, 255, 255, 0.55)",
              border:"1px solid rgba(218, 216, 216, 1)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.54)",
              position: "relative",
            }}
          >
            <Typography
              pb={3}
              fontSize={{ xs: "2rem", md: "3.5rem" }}
              fontWeight="bold"
              color={"#4207c0d8"}
            >
              Login
            </Typography>


            <form onSubmit={onSubmit}>
              <TextField
                label="Correo electrónico"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                sx={{
                  mb:3,
                  "& .MuiInputLabel-root": {
                    color: "#2a2929ff", 
                    fontSize: "1.2rem",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#292929ff", 
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      
                      fontSize: "1.4rem",
                      borderColor: "#5a5959ff",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3a3a3aff", 
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#555",
                    },
                    "& input": {
                      color: "#1c1b1bff", 
                      fontSize: "1.4rem",
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px rgba(240, 240, 240, 0) inset", 
                      WebkitTextFillColor: "#1c1b1bff", 
                      transition: "background-color 5000s ease-in-out 0s", // evita el flash azul del autorelleno 
                    },
                  },
                }}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                 sx={{
                   mb:3.5,
                  "& .MuiInputLabel-root": {
                    color: "#2a2929ff", 
                    fontSize: "1.2rem",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#292929ff", 
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#5a5959ff",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3a3a3aff", 
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#555",
                    },
                    "& input": {
                      color: "#1c1b1bff", 
                      fontSize: "1.4rem",
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px rgba(240, 240, 240, 0) inset", 
                      WebkitTextFillColor: "#1c1b1bff", 
                      transition: "background-color 5000s ease-in-out 0s", // evita el flash azul del autorelleno 
                    },
                  },
                }}
              />

              {error && (
                <Typography color="error" fontSize={14} mt={1}>
                  {error}
                </Typography>
              )}

              <Button
                fullWidth
                type="submit"
                disabled={loading}
                variant="outlined"
                sx={{
                  mt: 4,
                  py: 1.4,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1.3rem",
                  borderRadius: 2,
                  backgroundColor: "transparent",
                  color: "#4207c0ff",
                  border: "2px solid #4207c0ff",
                  transition: "all 200ms ease",
                  "&:hover": {
                    backgroundColor: "#4207c09e",
                    borderColor: "#4207c087",
                    color: "#e9e9e9ff",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(36, 18, 138, 0.3)",
                    color: "rgba(63,41,186,0.3)",
                    backgroundColor: "transparent",
                  },
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
                color: darkMode ? "grey.800" : "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              © {new Date().getFullYear()} Krivora Mx — Todos los derechos reservados
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
