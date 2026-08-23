import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export default function CalendarSuccess() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'DOCTOR') {
      navigate('/doctor/dashboard');
    } else if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="page-layout" style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ padding: 40, maxWidth: 440, textAlign: 'center' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Calendar Connected!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Your Google Calendar has been successfully linked. Appointments will now sync automatically.
        </p>
        <button onClick={handleReturn} className="btn btn-accent btn-full">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
