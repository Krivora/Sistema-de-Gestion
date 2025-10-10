import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 p-3">
      {/* Botón Anterior */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm 
          ${page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
        `}
      >
        <ChevronLeft fontSize="small" />
      </button>

      {/* Números */}
      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border
            ${page === num
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
          `}
        >
          {num}
        </button>
      ))}

      {/* Botón Siguiente */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm 
          ${page === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"}
        `}
      >
        <ChevronRight fontSize="small" />
      </button>
    </div>
  );
}
