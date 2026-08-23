import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { calendarApi } from '../../api/calendar.api';
import { Calendar, Plus, Clock, User, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  useEffect(() => {
    appointmentsApi.getPatientAppointments()
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let loginTime = sessionStorage.getItem('loginTimestamp');
    if (!loginTime) {
      loginTime = String(Date.now());
      sessionStorage.setItem('loginTimestamp', loginTime);
    }
    const elapsed = Date.now() - parseInt(loginTime, 10);
    const maxAgeMs = 4 * 60 * 1000;

    if (elapsed >= maxAgeMs) {
      setShowAlertBanner(false);
    } else {
      const remaining = maxAgeMs - elapsed;
      const timer = setTimeout(() => setShowAlertBanner(false), remaining);
      return () => clearTimeout(timer);
    }
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

  const leaveAlerts = user?.notifications?.filter(n => n.type === 'LEAVE_CONFLICT' || n.type === 'CANCELLATION') || [];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Welcome back, {user?.name}</h1>
              <p>Your healthcare overview</p>
            </div>
            <Link to="/patient/doctors" className="btn btn-accent">
              <Plus size={15} /> New Appointment
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {showAlertBanner && leaveAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="mb-20"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {leaveAlerts.map((n) => {
                const doctorRaw = n.payload?.doctorName || '';
                const cleanDoctorName = doctorRaw.replace(/^Dr\.?\s+/i, '');
                return (
                  <div key={n.id} className="alert alert-danger" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 2 }}>Appointment Cancelled</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {cleanDoctorName ? `${cleanDoctorName} is unavailable.` : 'An appointment was cancelled due to schedule changes.'} Please select an alternative time.
                      </span>
                    </div>
                    <button onClick={() => setShowAlertBanner(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!user?.hasGcalConnected && (
          <div className="card mb-24" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderLeft: '3px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Sync with Google Calendar</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Add appointments to your schedule automatically.</div>
              </div>
            </div>
            <button onClick={handleConnectCalendar} className="btn btn-ghost btn-sm">Connect</button>
          </div>
        )}

        <div className="grid-stats mb-32">
          <div className="card stat-card">
            <div className="stat-label"><Calendar size={15} /> Upcoming</div>
            <div className="stat-value">{upcoming.length}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label"><CheckCircle2 size={15} /> Completed</div>
            <div className="stat-value">{past.length}</div>
          </div>
        </div>

        <h2 className="section-title mb-12">Upcoming Appointments</h2>

        {loading ? (
          <div className="loading-text">Loading appointments...</div>
        ) : upcoming.length === 0 ? (
          <div className="card empty-state">
            <Calendar size={36} />
            <h3>No upcoming appointments</h3>
            <p>Book a visit with one of our doctors.</p>
            <Link to="/patient/doctors" className="btn btn-accent">Find a Doctor</Link>
          </div>
        ) : (
          <div className="card list-stack">
            {upcoming.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="list-item">
                <div className="list-item-info">
                  <div className="avatar avatar-md">
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>
                      {(a.doctor?.user?.name || '').replace(/^Dr\.?\s+/i, '')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{a.doctor?.specialisation}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {new Date(a.startsAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="list-item-actions">
                  {a.symptomForm?.urgency && <UrgencyBadge level={a.symptomForm.urgency} />}
                  <Link to={`/patient/appointments/${a.id}`} className="btn btn-ghost btn-sm">View</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
