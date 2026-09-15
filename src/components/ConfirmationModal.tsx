import { useEffect, useState, ReactNode } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: ReactNode;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
  idPrefix?: string;
  requiredConfirmationText?: string;
  confirmationInputPlaceholder?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message,
  subtitle,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
  variant = 'danger',
  idPrefix = 'confirm-modal',
  requiredConfirmationText,
  confirmationInputPlaceholder,
}: ConfirmationModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedConfirmation('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isConfirmDisabled =
    isLoading ||
    (Boolean(requiredConfirmationText) && typedConfirmation !== requiredConfirmationText);

  return (
    <div
      id={`${idPrefix}-backdrop`}
      onClick={() => {
        if (!isLoading) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-title`}
    >
      <div
        id={`${idPrefix}-card`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[#FAF8F5] border border-[#EAE3D6] p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[#3c2415]"
      >
        {/* Close Button */}
        <button
          id={`${idPrefix}-close-btn`}
          onClick={onClose}
          disabled={isLoading}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 rounded-full p-2 text-[#7A6B60] hover:bg-[#F2ECE3] hover:text-[#3c2415] transition-colors disabled:opacity-40 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Layout */}
        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          <div
            id={`${idPrefix}-icon-badge`}
            className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xs ${
              isDanger
                ? 'bg-[#FAF4EF] text-[#A64B2A] border border-[#EBDCCF]'
                : 'bg-[#FDFBF2] text-[#B89047] border border-[#E8DFC2]'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          {/* Texts */}
          <div className="flex-1 pr-4">
            <h3
              id={`${idPrefix}-title`}
              className="font-serif-display text-xl font-medium text-[#3c2415]"
            >
              {title}
            </h3>
            <div
              id={`${idPrefix}-message`}
              className="mt-2 text-xs sm:text-sm text-[#6B5A4E] leading-relaxed font-light"
            >
              {message}
            </div>
            {subtitle && (
              <p
                id={`${idPrefix}-subtitle`}
                className="mt-2 text-xs text-[#8A7A6E]"
              >
                {subtitle}
              </p>
            )}

            {requiredConfirmationText && (
              <div className="mt-3.5 pt-3 border-t border-[#EAE3D6]/70">
                <label
                  htmlFor={`${idPrefix}-confirm-input`}
                  className="block text-[11px] font-medium text-[#7A6B60] mb-1.5"
                >
                  Ketik <span className="font-bold text-[#A64B2A] tracking-wider">{requiredConfirmationText}</span> untuk mengonfirmasi:
                </label>
                <input
                  id={`${idPrefix}-confirm-input`}
                  type="text"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder={confirmationInputPlaceholder || `Ketik "${requiredConfirmationText}"`}
                  disabled={isLoading}
                  autoComplete="off"
                  className="w-full rounded-xl bg-white border border-[#DDD3C4] px-3.5 py-2 text-xs font-mono font-bold text-[#3c2415] tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#A64B2A]/25 focus:border-[#A64B2A] placeholder:text-[#BAABA0] placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#EAE3D6]">
          <button
            id={`${idPrefix}-cancel-btn`}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-[#DDD3C4] bg-white px-4 py-2 text-xs font-medium text-[#6B5A4E] hover:bg-[#F2ECE3] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id={`${idPrefix}-confirm-btn`}
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`rounded-xl px-5 py-2 text-xs font-semibold tracking-wide text-white transition-colors shadow-xs flex items-center gap-2 ${
              isConfirmDisabled
                ? 'bg-[#C7B9A9] text-[#7A6B60] cursor-not-allowed opacity-60'
                : isDanger
                ? 'bg-[#A64B2A] hover:bg-[#8F3E20] cursor-pointer'
                : 'bg-[#3c2415] hover:bg-[#28170d] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
                <span>Memproses...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
