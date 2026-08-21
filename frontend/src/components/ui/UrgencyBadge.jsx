import React from 'react';
import { motion } from 'framer-motion';

export default function UrgencyBadge({ level }) {
  const normalized = (level || 'Medium').toLowerCase();

  const configs = {
    high: {
      bg: 'rgba(244, 63, 94, 0.15)',
      color: 'var(--accent-rose)',
      border: 'rgba(244, 63, 94, 0.4)',
      label: 'High Urgency',
      animate: { scale: [1, 1.05, 1] }
    },
    medium: {
      bg: 'rgba(251, 191, 36, 0.15)',
      color: 'var(--accent-amber)',
      border: 'rgba(251, 191, 36, 0.4)',
      label: 'Medium Urgency',
      animate: {}
    },
    low: {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: 'var(--accent-emerald)',
      border: 'rgba(16, 185, 129, 0.4)',
      label: 'Low Urgency',
      animate: {}
    }
  };

  const config = configs[normalized] || configs.medium;

  return (
    <motion.span
      animate={config.animate}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.color
        }}
      />
      {config.label}
    </motion.span>
  );
}
