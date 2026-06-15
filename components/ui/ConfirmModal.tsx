'use client'
import { Modal } from './Modal'

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  destructive?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmText = 'Confirm', destructive = false }: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={destructive ? "btn-primary !bg-semantic-red" : "btn-primary"}>{confirmText}</button>
        </>
      }
    >
      <p className="text-sm text-text-muted">{description}</p>
    </Modal>
  )
}
