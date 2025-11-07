import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function Pagination({ page, totalPages, onChange }) {
  // Calcula rango dinámico (ventana de 5)
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  // Si estamos al final, ajustamos el inicio
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex justify-center items-center gap-2 p-3 flex-wrap">
      {/* Botón Anterior */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm 
          ${page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}`}
      >
        <ChevronLeft fontSize="small" />
      </button>

      {/* Botón para ir al inicio */}
      {start > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm 
              bg-white text-gray-600 hover:bg-gray-100 border-gray-300`}
          >
            1
          </button>
          {start > 2 && <span className="text-gray-400 text-sm">…</span>}
        </>
      )}

      {/* Botones visibles */}
      {visiblePages.map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border
            ${page === num
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}`}
        >
          {num}
        </button>
      ))}

      {/* Botón para ir al final */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 text-sm">…</span>}
          <button
            onClick={() => onChange(totalPages)}
            className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm 
              bg-white text-gray-600 hover:bg-gray-100 border-gray-300`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón Siguiente */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm 
          ${page === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}`}
      >
        <ChevronRight fontSize="small" />
      </button>
    </div>
  );
}
