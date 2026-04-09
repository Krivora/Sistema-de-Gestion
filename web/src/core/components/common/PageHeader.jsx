import { useNavigate } from "react-router-dom";
import { Home, ChevronRight } from "@mui/icons-material";

/**
 * @param {string}   title
 * @param {string}   [description]
 * @param {Array<{ label: string, to?: string }>} [breadcrumbs]
 * @param {ReactNode} [actions]  — botones/acciones a la derecha
 */
export default function PageHeader({ title, description, breadcrumbs = [], actions }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 space-y-1.5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
        >
          <Home sx={{ fontSize: 13 }} />
          <span>Inicio</span>
        </button>

        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight sx={{ fontSize: 13, color: "var(--color-border)" }} />
            {crumb.to ? (
              <button
                onClick={() => navigate(crumb.to)}
                className="text-xs transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}

        {breadcrumbs.length === 0 && (
          <>
            <ChevronRight sx={{ fontSize: 13, color: "var(--color-border)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {title}
            </span>
          </>
        )}
      </nav>

      {/* Título + acciones */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2
            className="text-xl font-semibold leading-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}