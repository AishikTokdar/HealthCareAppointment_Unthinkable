import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { ArrowLeft, User, Clock, AlertCircle, FileEdit, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.getDetail(id)
      .then(res => setAppointment(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, color: 'var(--text-muted)' }}>Loading briefing...</main>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1000 }}>
        <button onClick={() => navigate('/doctor/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Schedule
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>Pre-Visit Patient Briefing</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Patient: {appointment.patient?.name}</p>
          </div>
          {appointment.status !== 'COMPLETED' && (
            <Link to={`/doctor/visit/${appointment.id}`} className="btn-primary">
              <FileEdit size={16} /> Record Visit & Prescription
            </Link>
          )}
        </div>

        <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <User size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>{appointment.patient?.name}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Email: {appointment.patient?.email} • Phone: {appointment.patient?.phone || 'N/A'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Slot Time</span>
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{new Date(appointment.startsAt).toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</span>
              <strong style={{ fontSize: 14, color: 'var(--accent-cyan)' }}>{appointment.status}</strong>
            </div>
            {appointment.symptomForm?.urgency && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Triage Urgency</span>
                <UrgencyBadge level={appointment.symptomForm.urgency} />
              </div>
            )}
          </div>
        </div>

        {appointment.symptomForm && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} style={{ color: 'var(--accent-cyan)' }} /> AI Symptom Triage Briefing
            </h3>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Chief Complaint</h4>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}>{appointment.symptomForm.chiefComplaint}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Raw Symptoms Reported</h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                {appointment.symptomForm.rawSymptoms}
              </p>
            </div>

            {appointment.symptomForm.suggestedQs && appointment.symptomForm.suggestedQs.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Suggested Diagnostic Questions for Doctor</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {appointment.symptomForm.suggestedQs.map((q, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--text-primary)' }}>
                      <HelpCircle size={18} style={{ color: 'var(--accent-violet)' }} />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {appointment.visitNote && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)' }} /> Recorded Clinical Notes
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{appointment.visitNote.clinicalNotes}</p>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Generated Patient Summary</h4>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)' }}>{appointment.visitNote.patientSummary}</p>
          </div>
        )}
      </main>
    </div>
  );
}
