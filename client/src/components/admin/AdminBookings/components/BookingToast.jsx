import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function BookingToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`admin-booking-toast ${toast.type === 'success' ? 'admin-booking-toast--success' : 'admin-booking-toast--error'}`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} className="admin-booking-toast-icon--success" />
      ) : (
        <AlertCircle size={18} className="admin-booking-toast-icon--error" />
      )}
      <span className="admin-booking-toast-msg">{toast.message}</span>
      <button type="button" onClick={onClose} className="admin-toast-close" title="Close notification">
        <X size={15} />
      </button>
    </div>
  );
}

export default BookingToast;
