import PageHeader from "../components/ui/PageHeader";

const Photos = () => {
    return (
        <div>
            <PageHeader
                eyebrow="Perfil"
                title="Fotos y descripción"
                description="Esto es lo que ven tus clientes en la landing page."
            />
            <p style={{ color: "var(--text-secondary)" }}>Próximamente.</p>
        </div>
    );
};

export default Photos;
