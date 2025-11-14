import PageHeader from "@core/components/common/PageHeader";
export default function PermissionSettings() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Permisos del Sistema"
        description="Administra Permisos del sistema."
        breadcrumbs={[
           { label: "Configuración", to: "/config" },
            { label: "Permisos" },
        ]}
      />
    </div>
  );
}
