import PageHeader from "@core/components/common/PageHeader";
export default function AuditSettings() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Auditoria del Sistema"
        description="Consulta información detallada sobre lo realizado en el sistema."
        breadcrumbs={[
           { label: "Configuración", to: "/config" },
            { label: "Auditoria" },
        ]}
      />
    </div>
  );
}
