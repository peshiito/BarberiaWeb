import { Link } from "react-router-dom";
import { BRANCHES } from "../../data/branches";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { IconPin } from "../ui/icons";
import "./BranchesTeaser.css";

export default function BranchesTeaser() {
    return (
        <section className="section section-cream">
            <div className="container branches-teaser-inner">
                <p className="eyebrow">Sucursales</p>
                <h2 className="section-title">Dónde encontrarnos</h2>

                {BRANCHES.length === 0 ? (
                    <div style={{ marginTop: "var(--space-6)" }}>
                        <EmptyState
                            icon={<IconPin />}
                            title="Estamos cargando esta sección"
                            text="Muy pronto vas a poder ver dirección, horarios y cómo llegar."
                        />
                    </div>
                ) : (
                    <p className="section-lede">{BRANCHES.length} sucursal{BRANCHES.length > 1 ? "es" : ""} disponible{BRANCHES.length > 1 ? "s" : ""}.</p>
                )}

                <Button as={Link} to="/sucursales" variant="secondary" style={{ marginTop: "var(--space-6)" }}>
                    Ver sucursales
                </Button>
            </div>
        </section>
    );
}
