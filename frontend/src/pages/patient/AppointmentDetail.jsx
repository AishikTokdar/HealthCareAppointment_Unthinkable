import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import Modal from '../../components/ui/Modal';
import { appointmentsApi } from '../../api/appointments.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { ArrowLeft, User, Clock, Pill, AlertCircle, Send, MessageSquare, Circle, XCircle, Download, FileText } from 'lucide-react';

export default function PatientAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Real-time Chat & Presence State
  const [chatStatus, setChatStatus] = useState('NOT_STARTED');
  const [isDoctorOnline, setIsDoctorOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [closingChat, setClosingChat] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    let intervalId;
    if (appointment && appointment.status === 'CONFIRMED') {
      runHeartbeat();
      intervalId = setInterval(runHeartbeat, 4000);
    }
    return () => clearInterval(intervalId);
  }, [appointment]);

  const fetchDetail = () => {
    setLoading(true);
    appointmentsApi.getDetail(id)
      .then(res => {
        setAppointment(res.data);
        if (res.data.chatStatus) setChatStatus(res.data.chatStatus);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const runHeartbeat = () => {
    appointmentsApi.heartbeat(id)
      .then(res => {
        if (res.data.chatStatus) setChatStatus(res.data.chatStatus);
        setIsDoctorOnline(!!res.data.isCounterpartOnline);
        if (res.data.messages) setMessages(res.data.messages);
      })
      .catch(() => {});
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    try {
      await appointmentsApi.sendMessage(id, newMessage);
      setNewMessage('');
      runHeartbeat();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCloseChat = async () => {
    if (!window.confirm('Are you sure you want to end this chat session?')) return;
    setClosingChat(true);
    try {
      await appointmentsApi.closeChat(id);
      setChatStatus('CLOSED');
      runHeartbeat();
    } catch (err) {
      alert('Failed to close chat');
    } finally {
      setClosingChat(false);
    }
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
          <div style={{ display: 'flex', gap: 12 }}>
            {appointment.visitNote && (
              <button
                onClick={() => generatePrescriptionPdf(appointment, 'PATIENT')}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Download size={16} /> Download Prescription PDF
              </button>
            )}
            {appointment.status === 'CONFIRMED' && (
              <button onClick={() => setShowCancelModal(true)} className="btn-danger">
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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

            {appointment.status === 'CONFIRMED' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                background: isDoctorOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: isDoctorOnline ? 'var(--accent-emerald)' : 'var(--text-muted)',
                border: `1px solid ${isDoctorOnline ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'}`
              }}>
                <Circle size={10} style={{ fill: isDoctorOnline ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                Doctor Status: {isDoctorOnline ? 'Online' : 'Offline'}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Date & Time</span>
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{new Date(appointment.startsAt).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</span>
              <strong style={{ fontSize: 14, color: appointment.status === 'CONFIRMED' ? 'var(--accent-emerald)' : appointment.status === 'COMPLETED' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>{appointment.status}</strong>
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
              <AlertCircle size={20} style={{ color: 'var(--accent-cyan)' }} /> Submitted Symptoms Summary
            </h3>
            <div>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Chief Complaint / Reported Symptoms</h4>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{appointment.symptomForm.chiefComplaint || appointment.symptomForm.rawSymptoms}</p>
            </div>
          </motion.div>
        )}

        <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={20} style={{ color: 'var(--accent-violet)' }} /> Doctor Consultation Chat
            </h3>

            {chatStatus === 'ACTIVE' && (
              <button onClick={handleCloseChat} disabled={closingChat} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 13, borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}>
                <XCircle size={14} /> {closingChat ? 'Closing...' : 'Close Chat'}
              </button>
            )}
          </div>

          {chatStatus === 'NOT_STARTED' ? (
            <div style={{ background: 'var(--bg-surface)', padding: 24, textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                Doctor is currently reviewing your symptom submission. Live chat consultation will start as soon as the doctor initiates the session.
              </p>
            </div>
          ) : chatStatus === 'CLOSED' ? (
            <div style={{ background: 'var(--bg-surface)', padding: 16, textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 14 }}>
              Consultation chat session has been closed.
            </div>
          ) : (
            <div>
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: 16 }}>
                    Chat consultation active. Send your message to the doctor below.
                  </div>
                ) : (
                  messages.map(m => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: isMe ? 'var(--accent-violet)' : 'var(--bg-surface)',
                        color: isMe ? '#fff' : 'var(--text-primary)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: isMe ? 'none' : '1px solid var(--border-light)'
                      }}>
                        <div style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--accent-cyan)', fontWeight: 600, marginBottom: 4 }}>
                          {m.sender?.name} ({m.sender?.role})
                        </div>
                        <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>{m.message}</p>
                        <span style={{ fontSize: 10, display: 'block', textAlign: 'right', marginTop: 6, color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {appointment.status === 'CONFIRMED' && (
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    className="input-field"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to the doctor..."
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={sendingMsg} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Send size={16} /> Send
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {appointment.visitNote && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pill size={20} style={{ color: 'var(--accent-emerald)' }} /> Post-Visit Summary & Prescription
              </h3>
              <button
                onClick={() => generatePrescriptionPdf(appointment, 'PATIENT')}
                className="btn-secondary"
                style={{ fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Download Official PDF
              </button>
            </div>

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
