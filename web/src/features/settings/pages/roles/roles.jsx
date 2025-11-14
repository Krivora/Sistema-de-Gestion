import PageHeader from "@core/components/common/PageHeader";
export default function RoleSettings() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Roles del Sistema"
        description="Administra roles del sistema."
        breadcrumbs={[
           { label: "Configuración", to: "/config" },
            { label: "Roles" },
        ]}
      />
    </div>
  );
}
