// client/src/components/ConfirmModal.tsx
// Bu komponent brauzerin köhnə window.confirm və alert pəncərələrini əvəz edən,
// xüsusi zərif dizaynlı təsdiq modalıdır.

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Qırmızı və ya qəhvəyi vurğu üçün
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Bəli, təsdiq et',
  cancelText = 'Ləğv et',
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white border border-borderBeige rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Yuxarı İkon və Bağlama Düyməsi */}
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-accent/20 text-accent'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-primary rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mətn */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <p className="text-secondary text-xs sm:text-sm leading-relaxed">{message}</p>
        </div>

        {/* Düymələr */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-cream/70 hover:bg-cream text-secondary hover:text-primary font-bold text-xs rounded-xl border border-borderBeige transition"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                : 'bg-primary hover:bg-primary-hover shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
