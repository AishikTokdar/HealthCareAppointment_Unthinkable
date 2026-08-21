import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { adminApi } from '../../api/admin.api';

export default function NotificationLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getNotifications()
      .then(res => setLogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Notification Outbox Audit</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Real-time logs of system emails, background retries, and delivery statuses.</p>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading notification log...</div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px' }}>Recipient</th>
                  <th style={{ padding: '14px 20px' }}>Type</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Attempts</th>
                  <th style={{ padding: '14px 20px' }}>Created At (IST)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      {log.user?.name}
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>{log.user?.email}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: 12 }}>{log.type}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: log.status === 'SENT' ? 'rgba(16, 185, 129, 0.15)' : log.status === 'FAILED' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: log.status === 'SENT' ? 'var(--accent-emerald)' : log.status === 'FAILED' ? 'var(--accent-rose)' : 'var(--accent-amber)'
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>{log.attempts}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
