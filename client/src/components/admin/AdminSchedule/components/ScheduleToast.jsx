import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ScheduleToast({ feedback, onClose }) {
  if (!feedback) return null;

  return (
    <div
      className={`admin-schedule-toast ${feedback.type === 'success' ? 'admin-schedule-toast--success' : 'admin-schedule-toast--error'}`}
    >
      {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{feedback.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="admin-schedule-toast-close"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
