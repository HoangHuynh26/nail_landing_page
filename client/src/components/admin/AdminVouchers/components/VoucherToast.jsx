import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function VoucherToast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`admin-vouchers-toast ${toast.type === "success" ? "admin-vouchers-toast--success" : "admin-vouchers-toast--error"}`}>
      {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{toast.message}</span>
    </div>
  );
}

export default VoucherToast;
