import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { doctorsApi } from '../../api/doctors.api';
import { appointmentsApi } from '../../api/appointments.api';
import { User, ArrowLeft } from 'lucide-react';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');

  const [step, setStep] = useState(1);
  const [holdToken, setHoldToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorsApi.getPublicProfile(doctorId)
      .then(res => setDoctor(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctorId) {
      doctorsApi.getSlots(doctorId, selectedDate)
        .then(res => { setSlotsData(res.data); setSelectedSlot(null); })
        .catch(console.error);
    }
  }, [doctorId, selectedDate]);

  const handleHold = async () => {
    if (!selectedSlot) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await appointmentsApi.holdSlot(doctorId, selectedSlot.startsAt);
      setHoldToken(res.data.holdToken);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to hold slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) { setError('Please describe your symptoms.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await appointmentsApi.confirmBooking(holdToken, symptoms);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Confirmation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main"><div className="loading-text">Loading doctor profile...</div></main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 860 }}>
        <button onClick={() => navigate('/patient/doctors')} className="back-link">
          <ArrowLeft size={14} /> Back to doctors
        </button>

        <div className="card mb-24" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="avatar avatar-md"><User size={22} /></div>
          <div>
            <div style={{ fontWeight: 500 }}>{(doctor?.user?.name || '').replace(/^Dr\.?\s+/i, '')}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{doctor?.specialisation} · {doctor?.slotDuration} min slots</div>
          </div>
        </div>

        <div className="steps-indicator mb-8">
          <span className={`step-dot${step >= 1 ? ' active' : ''}`} />
          <span style={{ fontSize: 11 }}>Select Time</span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span className={`step-dot${step >= 2 ? ' active' : ''}`} />
          <span style={{ fontSize: 11 }}>Symptoms</span>
        </div>

        {error && (
          <div className="alert alert-danger mb-16" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span>{error}</span>
            {step === 2 && (
              <button onClick={() => { setError(''); setStep(1); }} className="btn btn-ghost btn-sm">
                Select New Time Slot
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: 24 }}>
            <h3 className="section-title mb-16">Select Date & Time</h3>

            <div className="form-group mb-20">
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ maxWidth: 260 }}
              />
            </div>

            {slotsData && !slotsData.available ? (
              <div className="alert alert-warning">{slotsData.reason}</div>
            ) : (
              <div>
                <label className="label mb-8">Available Slots</label>
                <div className="slot-grid mb-24">
                  {slotsData?.slots.map((slot, idx) => {
                    const isPast = slot.isPast || (new Date(slot.startsAt).getTime() <= Date.now());
                    const statusLabel = isPast ? ' (Slot Over)' : slot.isBooked ? ' (Booked)' : '';

                    return (
                      <button
                        key={idx}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`slot-btn${selectedSlot?.startsAt === slot.startsAt ? ' selected' : ''}`}
                      >
                        {new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{statusLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={handleHold} disabled={!selectedSlot || submitting} className="btn btn-accent btn-full btn-lg">
              {submitting ? 'Holding slot...' : 'Reserve & Continue'}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: 24 }}>
            <h3 className="section-title mb-4">Describe Your Symptoms</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Share details so the doctor can prepare for your visit.</p>

            <form onSubmit={handleConfirm}>
              <div className="form-group mb-20">
                <label className="label">Symptoms</label>
                <textarea className="input" rows={5} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe what you're experiencing..." required />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>Back</button>
                <button type="submit" disabled={submitting} className="btn btn-accent" style={{ flex: 2 }}>
                  {submitting ? 'Processing...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
