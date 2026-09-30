import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function PromotionToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`admin-promo-toast ${toast.type === 'success' ? 'admin-promo-toast--success' : 'admin-promo-toast--error'}`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} className="admin-promo-toast-icon admin-promo-toast-icon--success" />
      ) : (
        <AlertCircle size={18} className="admin-promo-toast-icon admin-promo-toast-icon--error" />
      )}
      <span className="admin-promo-toast-msg">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="admin-promo-toast-close"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default PromotionToast;
