import PageHeader from "../components/ui/PageHeader";

const AdminBarbers = () => {
    return (
        <div>
            <PageHeader eyebrow="Administración" title="Barberos" description="Gestioná el equipo de la barbería." />
            <p style={{ color: "var(--text-secondary)" }}>Próximamente.</p>
        </div>
    );
};

export default AdminBarbers;
