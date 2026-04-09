import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Typography,
  Paper, CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "@core/auth/useAuth";

// ── Validación local (sin librería externa — Fase 2 agrega Zod) ──────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FIELD_LENGTH = 254; // RFC 5321 máximo para email
const MIN_PASSWORD_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000; // 30 segundos

function validateFields(email, password) {
  if (!email.trim()) return "El correo es requerido";
  if (email.length > MAX_FIELD_LENGTH) return "Correo demasiado largo";
  if (!EMAIL_REGEX.test(email.trim())) return "Formato de correo inválido";
  if (!password) return "La contraseña es requerida";
  if (password.length < MIN_PASSWORD_LENGTH) return `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
  if (password.length > 128) return "Contraseña demasiado larga";
  return null;
}

// ── Estilos compartidos para TextField ───────────────────────────────────────

const textFieldSx = {
  mb: 3,
  "& .MuiInputLabel-root": { color: "#2a2929", fontSize: "1.1rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#292929" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#5a5959" },
    "&:hover fieldset": { borderColor: "#3a3a3a" },
    "&.Mui-focused fieldset": { borderColor: "#555" },
    "& input": { color: "#1c1b1b", fontSize: "1.1rem" },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px transparent inset",
      WebkitTextFillColor: "#1c1b1b",
      transition: "background-color 5000s ease-in-out 0s",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // local, no del AuthProvider

  // Control de intentos fallidos (en memoria — se resetea al recargar)
  const attemptsRef  = useRef(0);
  const lockedUntilRef = useRef(null);

  const clearError = useCallback(() => {
    if (error) setError("");
  }, [error]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Lockout check
    if (lockedUntilRef.current && Date.now() < lockedUntilRef.current) {
      const secsLeft = Math.ceil((lockedUntilRef.current - Date.now()) / 1000);
      setError(`Demasiados intentos. Espera ${secsLeft}s antes de reintentar.`);
      return;
    }

    // Sanitizar — trim solo en email, nunca en password
    const sanitizedEmail    = email.trim().toLowerCase();
    const sanitizedPassword = password; // no tocar contraseñas

    const validationError = validateFields(sanitizedEmail, sanitizedPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login(sanitizedEmail, sanitizedPassword);
      attemptsRef.current = 0;
      navigate("/", { replace: true });
    } catch (err) {
      attemptsRef.current += 1;

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        lockedUntilRef.current = Date.now() + LOCKOUT_MS;
        attemptsRef.current    = 0;
        setError(`Demasiados intentos fallidos. Espera ${LOCKOUT_MS / 1000}s.`);
      } else {
        // Mensaje genérico — no revelar si es email o password el incorrecto
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage: "url('/FondoLogin.webp')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: { xs: 2, sm: 6, md: 10 },
      }}
    >
      {/* Overlay gradiente */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, #3F29BA 0%, rgba(63,41,186,0) 100%)",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Layout principal */}
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", lg: 3000, xl: 2300 },
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Texto de bienvenida */}
        <Box
          sx={{
            width: { xs: "100%", md: "40%" },
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            p: { xs: 4, md: 0 },
            pr: { md: 2 },
            color: "#fff",
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              component="h1"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem", lg: "4rem" },
                color: "#fff",
                textShadow: "0 6px 18px rgba(0,0,0,0.35)",
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              ¡Bienvenido de nuevo a Inventra!
            </Typography>
            <Typography
              component="p"
              sx={{
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                lineHeight: 1.4,
              }}
            >
              Optimiza cada sucursal y conecta todo tu negocio.
            </Typography>
          </Box>
        </Box>

        {/* Card del form */}
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 4, md: 8 },
          }}
        >
          <Paper
            component="main"
            elevation={6}
            sx={{
              p: 6,
              width: "100%",
              maxWidth: 480,
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              bgcolor: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(218,216,216,1)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.54)",
            }}
          >
            <Typography
              component="h2"
              sx={{
                pb: 3,
                fontSize: { xs: "2rem", md: "2.8rem" },
                fontWeight: "bold",
                color: "#4207c0d8",
              }}
            >
              Iniciar sesión
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate // desactivar validación nativa — usamos la nuestra
            >
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                autoComplete="email"
                inputProps={{ maxLength: MAX_FIELD_LENGTH }}
                sx={textFieldSx}
              />

              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                autoComplete="current-password"
                inputProps={{ maxLength: 128 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={textFieldSx}
              />

              {/* Zona de error — altura fija para evitar layout shift */}
              <Box sx={{ minHeight: 24, mb: 1 }}>
                {error && (
                  <Typography
                    role="alert"
                    sx={{ color: "error.main", fontSize: "0.875rem" }}
                  >
                    {error}
                  </Typography>
                )}
              </Box>

              <Button
                fullWidth
                type="submit"
                disabled={isSubmitting}
                variant="outlined"
                sx={{
                  mt: 2,
                  py: 1.4,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  color: "#4207c0",
                  border: "2px solid #4207c0",
                  transition: "all 200ms ease",
                  "&:hover": {
                    backgroundColor: "#4207c09e",
                    borderColor: "#4207c087",
                    color: "#e9e9e9",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(63,41,186,0.3)",
                    color: "rgba(63,41,186,0.3)",
                  },
                }}
              >
                {isSubmitting
                  ? <CircularProgress size={22} color="inherit" />
                  : "Iniciar sesión"
                }
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ mt: 4, color: "text.secondary", fontSize: "0.85rem" }}
            >
              © {new Date().getFullYear()} Krivora Mx — Todos los derechos reservados
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}