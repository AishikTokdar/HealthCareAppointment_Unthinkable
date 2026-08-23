import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const config = {
    success: { icon: <CheckCircle size={16} />, borderColor: 'var(--success)' },
    error: { icon: <AlertCircle size={16} />, borderColor: 'var(--danger)' },
    info: { icon: <Info size={16} />, borderColor: 'var(--accent)' }
  };

  const c = config[toast.type] || config.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="card"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          maxWidth: 360,
          borderLeft: `3px solid ${c.borderColor}`
        }}
      >
        <span style={{ color: c.borderColor, display: 'flex' }}>{c.icon}</span>
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 2 }}
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
