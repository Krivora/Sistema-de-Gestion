// src/pages/Unauthorized.jsx
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeProvider";

export default function Unauthorized() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <h1 className="text-5xl font-bold mb-4">🚫 Acceso denegado</h1>
      <p className="text-lg mb-6">
        No tienes permisos para acceder a esta sección.
      </p>
      <Link
        to="/"
        className={`px-4 py-2 rounded-md ${
          darkMode
            ? "bg-indigo-600 hover:bg-indigo-500"
            : "bg-indigo-500 text-white hover:bg-indigo-600"
        }`}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
