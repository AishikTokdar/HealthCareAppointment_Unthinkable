import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { doctorsApi } from '../../api/doctors.api';
import { Calendar, User, Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorsApi.getDoctorAppointments()
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (user?.approvalStatus === 'PENDING') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: 40, maxWidth: 500, textAlign: 'center' }}>
            <AlertCircle size={48} style={{ color: 'var(--accent-amber)', marginBottom: 16 }} />
            <h2 style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 8 }}>Account Pending Approval</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Your doctor registration profile has been submitted and is currently being reviewed by clinic administration. You will be notified via email once approved.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
          Welcome, <span className="gradient-text">Dr. {user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Here is your clinical appointment schedule and pre-visit AI symptom briefings.</p>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No patient appointments scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {appointments.map((appt) => (
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
                    color: 'var(--accent-cyan)'
                  }}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{appt.patient?.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(appt.startsAt).toLocaleString()}
                    </p>
                    {appt.symptomForm?.chiefComplaint && (
                      <p style={{ fontSize: 13, color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                        Chief complaint: "{appt.symptomForm.chiefComplaint}"
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                  <Link to={`/doctor/appointments/${appt.id}`} className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
                    Review Patient <ChevronRight size={16} />
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
