import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { doctorsApi } from '../../api/doctors.api';
import { appointmentsApi } from '../../api/appointments.api';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RescheduleModal({ isOpen, onClose, appointment, onSuccess }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date());
      setSelectedDate('');
      setSlotsData(null);
      setSelectedSlot(null);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!appointment) return null;

  const doctorId = appointment.doctorId || appointment.doctor?.id;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prev.getFullYear() < today.getFullYear() || (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())) {
      return;
    }
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDate = async (dayNum) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setSelectedSlot(null);
    setErrorMsg('');
    setSlotsData(null);
    setLoadingSlots(true);

    try {
      const res = await doctorsApi.getSlots(doctorId, formattedDate);
      setSlotsData(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to fetch doctor availability.');
      setSlotsData({ available: false, reason: 'Failed to load availability', slots: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await appointmentsApi.reschedule(appointment.id, selectedSlot.startsAt);
      setSuccessMsg('Appointment rescheduled successfully. An email notification has been dispatched to your doctor and your previous slot has been freed.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'The doctor already has another appointment scheduled at this time. Please select a different time slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysGrid = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment - Full Calendar Selector">
      <div style={{ maxWidth: 640, width: '100%' }}>
        {errorMsg && (
          <div className="alert alert-danger mb-16" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={18} style={{ color: '#f87171', flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mb-16" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>{successMsg}</span>
          </div>
        )}

        <div className="card mb-16" style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Current Appointment: <strong style={{ color: 'var(--text-main)' }}>{new Date(appointment.startsAt).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            {monthNames[month]} {year}
          </h4>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={handlePrevMonth} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={handleNextMonth} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 6 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 20 }}>
          {daysGrid.map((dayNum, idx) => {
            if (!dayNum) {
              return <div key={`empty-${idx}`} style={{ height: 38 }} />;
            }

            const cellDate = new Date(year, month, dayNum);
            cellDate.setHours(0, 0, 0, 0);
            const isPast = cellDate < today;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dayNum}
                type="button"
                disabled={isPast}
                onClick={() => handleSelectDate(dayNum)}
                style={{
                  height: 38,
                  borderRadius: 8,
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--accent-subtle)' : isPast ? 'var(--bg-card-disabled)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--accent)' : isPast ? 'var(--text-muted)' : 'var(--text-main)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 13,
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="card" style={{ padding: 16, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} style={{ color: 'var(--accent)' }} /> Available Time Slots for {selectedDate}
            </div>

            {loadingSlots ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
                Checking real-time doctor availability and database conflicts...
              </div>
            ) : slotsData && !slotsData.available ? (
              <div className="alert alert-warning" style={{ fontSize: 13 }}>
                {slotsData.reason || 'No available slots on this date.'}
              </div>
            ) : slotsData && slotsData.slots ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {slotsData.slots.map((slot, idx) => {
                  const isSelected = selectedSlot?.startsAt === slot.startsAt;
                  const timeStr = new Date(slot.startsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  const isPast = slot.isPast || (new Date(slot.startsAt).getTime() <= Date.now());
                  const statusLabel = isPast ? '(Slot Over)' : slot.isBooked ? '(Booked)' : !slot.available ? '(Unavailable)' : '';

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        border: isSelected ? '2px solid var(--accent)' : slot.available ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.05)',
                        background: isSelected ? 'var(--accent)' : slot.available ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card-disabled)',
                        color: isSelected ? '#ffffff' : slot.available ? 'var(--success)' : 'var(--text-muted)',
                        cursor: slot.available ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {timeStr} {statusLabel && <span style={{ opacity: 0.75, fontSize: 11, marginLeft: 2 }}>{statusLabel}</span>}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitReschedule}
            disabled={submitting || !selectedSlot}
            className="btn btn-accent"
            style={{ flex: 1 }}
          >
            {submitting ? 'Confirming Reschedule...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
