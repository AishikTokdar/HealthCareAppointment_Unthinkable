import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle style={{ color: 'var(--accent-emerald)' }} size={20} />,
    error: <AlertCircle style={{ color: 'var(--accent-rose)' }} size={20} />,
    info: <Info style={{ color: 'var(--accent-cyan)' }} size={20} />
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--text-primary)',
          fontSize: 14,
          maxWidth: 400
        }}
      >
        {icons[toast.type] || icons.info}
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
