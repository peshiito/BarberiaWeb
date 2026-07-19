import PageHeader from "../components/ui/PageHeader";

const Schedule = () => {
    return (
        <div>
            <PageHeader
                eyebrow="Configuración"
                title="Mis horarios"
                description="Abrí tu agenda semanal y definí tus horarios de atención."
            />
            <p style={{ color: "var(--text-secondary)" }}>Próximamente.</p>
        </div>
    );
};

export default Schedule;
