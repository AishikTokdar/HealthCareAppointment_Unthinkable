import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { calendarApi } from '../../api/calendar.api';
import { Calendar, Plus, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.getPatientAppointments()
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const past = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  const handleConnectCalendar = async () => {
    try {
      const res = await calendarApi.getAuthUrl();
      window.location.href = res.data.url;
    } catch (err) {
      alert('Failed to connect Google Calendar');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
              Namaste, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Welcome to your healthcare portal</p>
          </div>
          <Link to="/patient/doctors" className="btn-primary">
            <Plus size={18} /> Book New Visit
          </Link>
        </div>

        {!user?.hasGcalConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              padding: 20,
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: '4px solid var(--accent-cyan)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Calendar size={28} style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Sync with Google Calendar</h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Automatically add your medical appointments to your personal schedule.</p>
              </div>
            </div>
            <button onClick={handleConnectCalendar} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
              Connect Now
            </button>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-violet)', marginBottom: 8 }}>
              <Calendar size={20} />
              <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Upcoming</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{upcoming.length}</div>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-emerald)', marginBottom: 8 }}>
              <CheckCircle2 size={20} />
              <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Completed Visits</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{past.length}</div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 20 }}>Upcoming Appointments</h2>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading appointments...</div>
        ) : upcoming.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No upcoming appointments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Book a visit with one of our specialized doctors today.</p>
            <Link to="/patient/doctors" className="btn-primary">Find a Doctor</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                  }}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Dr. {appt.doctor?.user?.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--accent-cyan)', marginBottom: 8 }}>{appt.doctor?.specialisation}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} /> {new Date(appt.startsAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                  <Link to={`/patient/appointments/${appt.id}`} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
