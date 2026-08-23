import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { User, Clock, ChevronRight } from 'lucide-react';

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

  const statusBadge = (status) => {
    const map = {
      CONFIRMED: 'badge-success',
      COMPLETED: 'badge-accent',
      CANCELLED: 'badge-danger',
      PENDING: 'badge-warning'
    };
    return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1050 }}>
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>View upcoming and past medical appointments.</p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)} className={`chip${filter === tab ? ' active' : ''}`}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-text">Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <User size={36} />
            <h3>No appointments found</h3>
            <p>No records in this category.</p>
          </div>
        ) : (
          <div className="card list-stack">
            {filtered.map((appt) => (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="list-item">
                <div className="list-item-info">
                  <div className="avatar avatar-md"><User size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{(appt.doctor?.user?.name || '').replace(/^Dr\.?\s+/i, '')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{appt.doctor?.specialisation}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {new Date(appt.startsAt).toLocaleString('en-IN')}
                      </span>
                      {statusBadge(appt.status)}
                    </div>
                  </div>
                </div>
                <div className="list-item-actions">
                  {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                  <Link to={`/patient/appointments/${appt.id}`} className="btn btn-ghost btn-sm">
                    View <ChevronRight size={14} />
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
