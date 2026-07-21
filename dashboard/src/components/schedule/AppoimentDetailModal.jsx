import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import "./AppointmentDetailModal.css";

const AppointmentDetailModal = ({ appointment, onClose, onComplete, onCancel, actionLoading }) => {
    if (!appointment) return null;

    const isCompleted = appointment.status === "completed";
    const dateLabel = appointment.date.slice(0, 10);
    const timeLabel = appointment.time.slice(0, 5);

    return (
        <Modal open={Boolean(appointment)} onClose={onClose} title="Detalle del turno">
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

                {!isCompleted && (
                    <div className="appt-detail-actions">
                        <button
                            className="appt-detail-btn is-cancel"
                            onClick={() => onCancel(appointment.id)}
                            disabled={actionLoading}
                        >
                            Cancelar turno
                        </button>
                        <button
                            className="appt-detail-btn is-complete"
                            onClick={() => onComplete(appointment.id)}
                            disabled={actionLoading}
                        >
                            Marcar completado
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AppointmentDetailModal;
