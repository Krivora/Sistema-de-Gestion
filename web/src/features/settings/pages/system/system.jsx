import PageHeader from "@core/components/common/PageHeader";
export default function SystemSettings() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title=" Configuración del Sistema"
        description="Administra roles, permisos y catálogos generales del sistema."
        breadcrumbs={[
           { label: "Configuración", to: "/config" },
            { label: "Sistema" },
        ]}
      />
    </div>
  );
}
