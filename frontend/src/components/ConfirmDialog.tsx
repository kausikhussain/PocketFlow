import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/80"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md glass-panel bg-white dark:bg-darkbg-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-zinc-800/60 p-6 z-10 text-center"
          >
            {/* Close */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkbg-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className={`mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDanger 
                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' 
                : 'bg-brand-50 dark:bg-brand-500/10 text-brand-500'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>

            {/* Title & Message */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sans mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-400 dark:text-zinc-500 mb-6 px-2 font-medium">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-darkbg-800 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl text-white shadow-md transition-all ${
                  isDanger
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                    : 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/25'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
