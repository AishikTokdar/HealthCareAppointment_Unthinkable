import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.getPatientAppointments()
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter(a => {
    if (filter === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'PENDING';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    if (filter === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>My Appointments</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>View your upcoming and historical medical appointments.</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={filter === tab ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: 13, padding: '8px 16px', textTransform: 'capitalize' }}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No appointments found in this category.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
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
                    color: 'var(--accent-violet)'
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
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: appt.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : appt.status === 'CANCELLED' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-surface)',
                        color: appt.status === 'CONFIRMED' ? 'var(--accent-emerald)' : appt.status === 'CANCELLED' ? 'var(--accent-rose)' : 'var(--text-secondary)'
                      }}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                  <Link to={`/patient/appointments/${appt.id}`} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                    View Summary <ChevronRight size={16} />
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
