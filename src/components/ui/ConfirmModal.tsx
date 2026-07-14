import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm?: () => void;
  onCancel: () => void;
  hideConfirm?: boolean;
};

function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
  hideConfirm = false
}: ConfirmModalProps) {
  const { t } = useTranslation();

  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-message-in rounded-xl p-6 w-full max-w-xs flex flex-col gap-4 border border-primary-border">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className={variant === 'danger' ? 'text-red-500' : 'text-amber-500'} />
          <p className="text-sm font-semibold text-text-main">{title}</p>
        </div>
        <p className="text-xs text-text-muted">{message}</p>
        <div className="flex gap-2">
          {!hideConfirm && onConfirm && (
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {resolvedConfirmLabel}
            </button>
          )}
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-primary-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-bg-sidebar transition"
          >
            {hideConfirm ? t('common.ok') : resolvedCancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
