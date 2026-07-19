import PageHeader from "../components/ui/PageHeader";

const AdminFinance = () => {
    return (
        <div>
            <PageHeader
                eyebrow="Administración"
                title="Finanzas"
                description="Ingresos, división de ganancias y caja."
            />
            <p style={{ color: "var(--text-secondary)" }}>Próximamente.</p>
        </div>
    );
};

export default AdminFinance;
