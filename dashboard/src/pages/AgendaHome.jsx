import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";

const AgendaHome = () => {
    const { user } = useAuth();

    return (
        <div>
            <PageHeader
                eyebrow="Hoy"
                title={`Hola, ${user?.first_name}`}
                description="Acá vas a ver tu agenda semanal con los turnos reservados."
            />
            <p style={{ color: "var(--text-secondary)" }}>
                La grilla semanal de turnos se construye en la próxima etapa.
            </p>
        </div>
    );
};

export default AgendaHome;
