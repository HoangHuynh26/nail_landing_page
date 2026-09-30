import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function GalleryToast({ toastMessage }) {
  if (!toastMessage) return null;

  return (
    <div
      className={`admin-gallery-toast ${toastMessage.type === 'error' ? 'admin-gallery-toast--error' : 'admin-gallery-toast--success'}`}
    >
      {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span>{toastMessage.text}</span>
    </div>
  );
}

export default GalleryToast;
