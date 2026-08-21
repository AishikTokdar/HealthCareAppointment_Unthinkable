import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import { doctorsApi } from '../../api/doctors.api';
import { appointmentsApi } from '../../api/appointments.api';
import { Calendar, Clock, User, Check, AlertCircle, ArrowLeft } from 'lucide-react';

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
        .then(res => {
          setSlotsData(res.data);
          setSelectedSlot(null);
        })
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
      setError(err.response?.data?.error || 'Failed to hold slot. It might already be reserved.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms before confirming.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await appointmentsApi.confirmBooking(holdToken, symptoms);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Confirmation failed. Your hold might have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, color: 'var(--text-muted)' }}>Loading doctor profile...</main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 900 }}>
        <button onClick={() => navigate('/patient/doctors')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Doctor Search
        </button>

        <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
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
            <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>{doctor?.user?.name}</h2>
            <p style={{ fontSize: 14, color: 'var(--accent-cyan)' }}>{doctor?.specialisation} • {doctor?.slotDuration} mins slot</p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>Step 1: Select Date & Available Time Slot</h3>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Appointment Date</label>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ maxWidth: 300 }}
              />
            </div>

            {slotsData && !slotsData.available ? (
              <div style={{ padding: 20, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', color: 'var(--accent-amber)', fontSize: 14 }}>
                {slotsData.reason}
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Available Slots</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
                  {slotsData?.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: selectedSlot?.startsAt === slot.startsAt ? '2px solid var(--accent-violet)' : '1px solid var(--border-light)',
                        background: selectedSlot?.startsAt === slot.startsAt ? 'rgba(124, 92, 252, 0.15)' : slot.available ? 'var(--bg-surface)' : 'rgba(255,255,255,0.03)',
                        color: slot.available ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        fontSize: 13,
                        fontWeight: 500
                      }}
                    >
                      {new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleHold}
              disabled={!selectedSlot || submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Holding slot...' : 'Reserve Slot & Continue'}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Step 2: Share Symptoms (Pre-Visit AI Summary)</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Describe your symptoms in detail. Our AI will analyze them for your doctor before your visit.</p>

            <form onSubmit={handleConfirm}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Describe your current symptoms</label>
                <textarea
                  className="input-field"
                  rows={5}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="E.g., I have been experiencing a persistent dry cough, mild headache, and fatigue for the past 3 days..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                  Back
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {submitting ? 'Processing Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
