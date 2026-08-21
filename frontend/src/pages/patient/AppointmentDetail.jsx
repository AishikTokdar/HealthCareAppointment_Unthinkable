import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import Modal from '../../components/ui/Modal';
import { appointmentsApi } from '../../api/appointments.api';
import { ArrowLeft, Calendar, User, Clock, Pill, HelpCircle, AlertCircle, XCircle } from 'lucide-react';

export default function PatientAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = () => {
    setLoading(true);
    appointmentsApi.getDetail(id)
      .then(res => setAppointment(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appointmentsApi.cancel(id, cancelReason);
      setShowCancelModal(false);
      fetchDetail();
    } catch (err) {
      alert('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, color: 'var(--text-muted)' }}>Loading appointment details...</main>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1000 }}>
        <button onClick={() => navigate('/patient/appointments')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Appointments
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>Appointment Overview</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Reference ID: {appointment.id}</p>
          </div>
          {appointment.status === 'CONFIRMED' && (
            <button onClick={() => setShowCancelModal(true)} className="btn-danger">
              Cancel Booking
            </button>
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
              color: 'var(--accent-violet)'
            }}>
              <User size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>{appointment.doctor?.user?.name}</h2>
              <p style={{ fontSize: 14, color: 'var(--accent-cyan)' }}>{appointment.doctor?.specialisation}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Date & Time</span>
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{new Date(appointment.startsAt).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</span>
              <strong style={{ fontSize: 14, color: appointment.status === 'CONFIRMED' ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>{appointment.status}</strong>
            </div>
            {appointment.symptomForm?.urgency && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Urgency Level</span>
                <UrgencyBadge level={appointment.symptomForm.urgency} />
              </div>
            )}
          </div>
        </div>

        {appointment.symptomForm && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} style={{ color: 'var(--accent-cyan)' }} /> AI Symptom Analysis (Pre-Visit)
            </h3>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Chief Complaint</h4>
              <p style={{ fontSize: 15, color: 'var(--text-primary)' }}>{appointment.symptomForm.chiefComplaint || appointment.symptomForm.rawSymptoms}</p>
            </div>

            {appointment.symptomForm.suggestedQs && appointment.symptomForm.suggestedQs.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Suggested Doctor Consultation Questions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {appointment.symptomForm.suggestedQs.map((q, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--text-secondary)' }}>
                      <HelpCircle size={16} style={{ color: 'var(--accent-violet)', flexShrink: 0, marginTop: 2 }} />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {appointment.visitNote && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Pill size={20} style={{ color: 'var(--accent-emerald)' }} /> Post-Visit Summary & Prescription
            </h3>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Patient-Friendly Summary</h4>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{appointment.visitNote.patientSummary || appointment.visitNote.clinicalNotes}</p>
            </div>

            {Array.isArray(appointment.visitNote.prescription) && appointment.visitNote.prescription.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Prescribed Medications</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {appointment.visitNote.prescription.map((med, idx) => (
                    <div key={idx} style={{ padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <strong style={{ fontSize: 15, color: 'var(--accent-emerald)', display: 'block', marginBottom: 4 }}>{med.drug}</strong>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block' }}>Dose: {med.dose}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block' }}>Frequency: {med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Appointment">
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Are you sure you want to cancel your appointment with {appointment.doctor?.user?.name}?
          </p>
          <textarea
            className="input-field"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (optional)..."
            style={{ marginBottom: 20 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowCancelModal(false)} className="btn-secondary" style={{ flex: 1 }}>Keep Booking</button>
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger" style={{ flex: 1 }}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
