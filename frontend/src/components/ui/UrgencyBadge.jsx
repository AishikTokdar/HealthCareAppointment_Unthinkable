import React from 'react';

export default function UrgencyBadge({ level }) {
  const normalized = (level || 'Medium').toLowerCase();

  const configs = {
    high: { cls: 'badge-danger', label: 'High' },
    medium: { cls: 'badge-warning', label: 'Medium' },
    low: { cls: 'badge-success', label: 'Low' }
  };

  const config = configs[normalized] || configs.medium;

  return (
    <span className={`badge ${config.cls}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
}
