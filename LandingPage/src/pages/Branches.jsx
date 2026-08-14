import { useDocumentHead } from "../hooks/useDocumentHead";
import { BRANCHES } from "../data/branches";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { IconPin, IconPhone, IconClock } from "../components/ui/icons";
import "./Branches.css";

export default function Branches() {
    useDocumentHead({ title: "Sucursales", description: "Dónde encontrarnos y cómo llegar a Oficio Barbería." });

    return (
        <section className="section section-dark">
            <div className="container">
                <p className="eyebrow">Sucursales</p>
                <h1 className="booking-step-title">Dónde encontrarnos</h1>

                {BRANCHES.length === 0 ? (
                    <div style={{ marginTop: "var(--space-7)" }}>
                        <EmptyState
                            icon={<IconPin />}
                            title="Estamos cargando esta sección"
                            text="Todavía no publicamos la dirección de nuestras sucursales. Muy pronto vas a poder ver ubicación, horarios y cómo llegar."
                        />
                    </div>
                ) : (
                    <div className="branches-grid">
                        {BRANCHES.map((branch) => (
                            <Card key={branch.id} className="branch-card">
                                {branch.lat && branch.lng && (
                                    <iframe
                                        className="branch-card-map"
                                        title={`Mapa de ${branch.name}`}
                                        src={`https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=15&output=embed`}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                )}
                                <p className="branch-card-name">{branch.name}</p>
                                <div className="branch-card-row">
                                    <IconPin width={16} height={16} />
                                    <span>{branch.address}</span>
                                </div>
                                <div className="branch-card-row">
                                    <IconPhone width={16} height={16} />
                                    <span>{branch.phone}</span>
                                </div>
                                <div className="branch-card-row">
                                    <IconClock width={16} height={16} />
                                    <span>{branch.hours}</span>
                                </div>
                                {branch.mapsUrl && (
                                    <Button as="a" href={branch.mapsUrl} target="_blank" rel="noreferrer" variant="secondary" size="sm">
                                        Cómo llegar
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
