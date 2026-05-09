'use client';
import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative card-base shadow-card-hover w-full max-w-md animate-scale-in p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${destructive ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={20} style={{ color: destructive ? 'var(--destructive)' : 'var(--warning)' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{title}</h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-outline text-sm px-4 py-2">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-150 active:scale-95 disabled:opacity-60 ${
              destructive ? 'bg-destructive hover:bg-red-700' : 'btn-primary'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}