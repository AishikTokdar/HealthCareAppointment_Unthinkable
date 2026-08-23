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
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1100 }}>
        <div className="page-header">
          <h1>Notification Outbox Audit</h1>
          <p>Real-time logs of system emails, background retries, and delivery statuses.</p>
        </div>

        {loading ? (
          <div className="loading-text">Loading notification log...</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Created At (IST)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{log.user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.user?.email}</div>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{log.type}</td>
                    <td>
                      <span className={`badge ${log.status === 'SENT' ? 'badge-success' : log.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.attempts}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
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
