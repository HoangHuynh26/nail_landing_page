import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function ServiceToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`admin-services-toast admin-services-toast--${toast.type}`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} className="admin-services-toast__icon--success" />
      ) : (
        <AlertCircle size={18} className="admin-services-toast__icon--error" />
      )}
      <span className="admin-services-toast__message">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="admin-services-toast__close-btn"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default ServiceToast;
