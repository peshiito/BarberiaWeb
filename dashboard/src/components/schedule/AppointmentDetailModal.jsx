import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import "./AppointmentDetailModal.css";

const AppointmentDetailModal = ({
    appointment,
    onClose,
    onComplete,
    onCancel,
    onReschedule,
    onViewClient,
    actionLoading,
}) => {
    const { isAdmin } = useAuth();
    const [confirmingCancel, setConfirmingCancel] = useState(false);

    if (!appointment) return null;

    const isCompleted = appointment.status === "completed";
    const dateLabel = appointment.date.slice(0, 10);
    const timeLabel = appointment.time.slice(0, 5);

    const handleClose = () => {
        setConfirmingCancel(false);
        onClose();
    };

    return (
        <Modal open={Boolean(appointment)} onClose={handleClose} title="Detalle del turno">
            <div className="appt-detail">
                <div className="appt-detail-row">
                    <span className="appt-detail-label">Cliente</span>
                    <span className="appt-detail-value">
                        {appointment.client_first_name} {appointment.client_last_name}
                    </span>
                </div>

                <div className="appt-detail-row">
                    <span className="appt-detail-label">Teléfono</span>
                    <span className="appt-detail-value appt-detail-mono">{appointment.client_phone}</span>
                </div>

                <div className="appt-detail-row">
                    <span className="appt-detail-label">Fecha</span>
                    <span className="appt-detail-value appt-detail-mono">{dateLabel}</span>
                </div>

                <div className="appt-detail-row">
                    <span className="appt-detail-label">Hora</span>
                    <span className="appt-detail-value appt-detail-mono">{timeLabel}</span>
                </div>

                <div className="appt-detail-row">
                    <span className="appt-detail-label">Precio</span>
                    <span className="appt-detail-value appt-detail-mono">
                        ${Number(appointment.price).toLocaleString("es-AR")}
                    </span>
                </div>

                <div className="appt-detail-row">
                    <span className="appt-detail-label">Estado</span>
                    <Badge tone={isCompleted ? "sage" : "brass"}>{isCompleted ? "Completado" : "Activo"}</Badge>
                </div>

                <div className="appt-detail-actions">
                    <Button
                        variant="ghost"
                        className="appt-detail-btn"
                        onClick={() => onViewClient(appointment.client_id)}
                    >
                        Ver cliente
                    </Button>
                    {!isCompleted && isAdmin && (
                        <Button
                            variant="ghost"
                            className="appt-detail-btn"
                            onClick={() => onReschedule(appointment)}
                            disabled={actionLoading}
                        >
                            Reprogramar
                        </Button>
                    )}
                </div>

                {!isCompleted && confirmingCancel && (
                    <p className="appt-detail-confirm">¿Seguro que querés cancelar este turno?</p>
                )}

                {!isCompleted && (
                    <div className="appt-detail-actions">
                        {confirmingCancel ? (
                            <>
                                <Button
                                    variant="ghost"
                                    className="appt-detail-btn"
                                    onClick={() => setConfirmingCancel(false)}
                                    disabled={actionLoading}
                                >
                                    Volver
                                </Button>
                                <Button
                                    variant="danger"
                                    className="appt-detail-btn"
                                    onClick={() => onCancel(appointment.id)}
                                    loading={actionLoading}
                                >
                                    Sí, cancelar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="danger"
                                    className="appt-detail-btn"
                                    onClick={() => setConfirmingCancel(true)}
                                    disabled={actionLoading}
                                >
                                    Cancelar turno
                                </Button>
                                <Button
                                    variant="success"
                                    className="appt-detail-btn"
                                    onClick={() => onComplete(appointment.id)}
                                    loading={actionLoading}
                                >
                                    Marcar completado
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AppointmentDetailModal;
