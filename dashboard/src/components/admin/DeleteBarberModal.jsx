import { useEffect, useState } from "react";
import { deleteBarber } from "../../services/admin";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import InlineFeedback from "../ui/InlineFeedback";
import Modal from "../ui/Modal";
import "./DeleteBarberModal.css";

const ROLE_LABEL = { admin: "administrador", admin_barber: "barbero admin", barber: "barbero" };

const DeleteBarberModal = ({ barber, onClose, onDeleted }) => {
    const [password, setPassword] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const requiresPassword = Boolean(barber);

    useEffect(() => {
        setPassword("");
        setError("");
    }, [barber]);

    const handleSubmit = async e => {
        e.preventDefault();
        setDeleting(true);
        setError("");
        try {
            await deleteBarber(barber.id, requiresPassword ? password : undefined);
            onDeleted();
        } catch (err) {
            setError(err.response?.data?.error || "No se pudo eliminar el usuario");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal open={Boolean(barber)} onClose={onClose} title="Eliminar usuario" size="sm">
            {barber && (
                <form className="delete-barber-form" onSubmit={handleSubmit}>
                    <p className="delete-barber-warning">
                        Vas a eliminar a <strong>{barber.first_name} {barber.last_name}</strong> ({ROLE_LABEL[barber.role] || barber.role}).
                        Esta acción no se puede deshacer: se borran también sus turnos, horarios y fotos cargadas.
                    </p>

                    {requiresPassword && (
                        <FormField label="Tu contraseña de administrador" hint="Confirmá tu identidad para eliminar a esta persona del equipo">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                autoFocus
                                required
                            />
                        </FormField>
                    )}

                    {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

                    <div className="delete-barber-actions">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={deleting}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="danger" loading={deleting}>
                            Eliminar definitivamente
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default DeleteBarberModal;
