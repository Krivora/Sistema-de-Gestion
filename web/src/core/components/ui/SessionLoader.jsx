export default function SessionLoader({ message = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {message}
        </p>
      </div>
    </div>
  );
}
