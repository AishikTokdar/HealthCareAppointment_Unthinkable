import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function CalendarSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 24
    }}>
      <div className="glass-card" style={{ padding: 40, maxWidth: 440, textAlign: 'center' }}>
        <CheckCircle2 size={56} style={{ color: 'var(--accent-emerald)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>Calendar Connected!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          Your Google Calendar has been successfully linked. Appointments will now sync automatically.
        </p>
        <button onClick={() => navigate('/patient/dashboard')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
