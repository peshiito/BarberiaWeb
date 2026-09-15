import Button from "./Button";
import Modal from "./Modal";
import "./ConfirmDialog.css";

const ConfirmDialog = ({ open, title, message, confirmLabel, icon = "warning", loading = false, onConfirm, onClose }) => (
    <Modal
        open={open}
        onClose={loading ? () => {} : onClose}
        size="sm"
        icon={icon}
        title={title}
        footer={
            <div className="confirm-dialog-actions">
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                    Volver
                </Button>
                <Button variant="danger-solid" onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </div>
        }
    >
        <p className="confirm-dialog-message">{message}</p>
    </Modal>
);

export default ConfirmDialog;
