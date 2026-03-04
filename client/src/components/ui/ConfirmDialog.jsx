import Button from './Button';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', loading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
