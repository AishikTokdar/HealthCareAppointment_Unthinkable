import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import Modal from '../../components/ui/Modal';
import RescheduleModal from '../../components/patient/RescheduleModal';
import { appointmentsApi } from '../../api/appointments.api';
import { doctorsApi } from '../../api/doctors.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { ArrowLeft, User, Clock, Pill, AlertCircle, Send, MessageSquare, XCircle, Download, Star, Calendar } from 'lucide-react';

export default function PatientAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const [chatStatus, setChatStatus] = useState('NOT_STARTED');
  const [isDoctorOnline, setIsDoctorOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [closingChat, setClosingChat] = useState(false);

  const [fetchError, setFetchError] = useState('');

  const handleRate = async () => {
    setSubmittingRating(true);
    try {
      await appointmentsApi.rate(id, { rating, feedback });
      setRatingSuccess(true);
      fetchDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  useEffect(() => {
    let intervalId;
    if (appointment && appointment.status === 'CONFIRMED') {
      runHeartbeat();
      intervalId = setInterval(runHeartbeat, 4000);
    }
    return () => clearInterval(intervalId);
  }, [appointment]);

  const fetchDetail = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const detailRes = await appointmentsApi.getDetail(id);
      setAppointment(detailRes.data);
      if (detailRes.data.chatStatus) setChatStatus(detailRes.data.chatStatus);
      try {
        const msgRes = await appointmentsApi.getChatMessages(id);
        setMessages(msgRes.data || []);
      } catch {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setFetchError(err.response?.data?.error || 'Appointment record not found or access denied.');
    } finally {
      setLoading(false);
    }
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
    try { await appointmentsApi.sendMessage(id, newMessage); setNewMessage(''); runHeartbeat(); }
    catch (err) { alert('Failed to send message'); }
    finally { setSendingMsg(false); }
  };

  const handleCloseChat = async () => {
    if (!window.confirm('End this chat session?')) return;
    setClosingChat(true);
    try { await appointmentsApi.closeChat(id); setChatStatus('CLOSED'); runHeartbeat(); }
    catch (err) { alert('Failed to close chat'); }
    finally { setClosingChat(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try { await appointmentsApi.cancel(id, cancelReason); setShowCancelModal(false); fetchDetail(); }
    catch (err) { alert('Failed to cancel appointment'); }
    finally { setCancelling(false); }
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main"><div className="loading-text">Loading appointment details...</div></main>
      </div>
    );
  }

  if (fetchError || !appointment) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main" style={{ maxWidth: 800 }}>
          <button onClick={() => navigate('/patient/appointments')} className="back-link">
            <ArrowLeft size={14} /> Back to appointments
          </button>
          <div className="card" style={{ padding: 40, textAlign: 'center', borderTop: '3px solid var(--danger)' }}>
            <AlertCircle size={36} style={{ color: 'var(--danger)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Appointment Record Unavailable</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              {fetchError || 'This appointment record could not be found or you do not have permission to view it.'}
            </p>
            <button onClick={() => navigate('/patient/dashboard')} className="btn btn-accent">
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 960 }}>
        <button onClick={() => navigate('/patient/appointments')} className="back-link">
          <ArrowLeft size={14} /> Back to appointments
        </button>

        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Appointment Details</h1>
              <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 11 }}>Ref: {appointment.id}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {appointment.visitNote && (
                <button onClick={() => generatePrescriptionPdf(appointment, 'PATIENT')} className="btn btn-ghost btn-sm">
                  <Download size={14} /> Download PDF
                </button>
              )}
              {appointment.status === 'CONFIRMED' && (
                <>
                  <button onClick={() => setShowRescheduleModal(true)} className="btn btn-secondary btn-sm">
                    <Calendar size={14} /> Reschedule
                  </button>
                  <button onClick={() => setShowCancelModal(true)} className="btn btn-danger btn-sm">Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card mb-24" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar avatar-lg"><User size={24} /></div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{appointment.doctor?.user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{appointment.doctor?.specialisation}</div>
              </div>
            </div>
            {appointment.status === 'CONFIRMED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span className={`online-dot ${isDoctorOnline ? 'online' : 'offline'}`} />
                {isDoctorOnline ? 'Online' : 'Offline'}
              </div>
            )}
          </div>

          <div className="detail-grid">
            <div>
              <div className="detail-label">Date & Time</div>
              <div className="detail-value">{new Date(appointment.startsAt).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="detail-label">Status</div>
              <div className="detail-value" style={{ color: appointment.status === 'CONFIRMED' ? 'var(--success)' : appointment.status === 'COMPLETED' ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {appointment.status}
              </div>
            </div>
            {appointment.symptomForm?.urgency && (
              <div>
                <div className="detail-label">Urgency</div>
                <UrgencyBadge level={appointment.symptomForm.urgency} />
              </div>
            )}
          </div>
        </div>

        {appointment.symptomForm && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card mb-24" style={{ padding: 20 }}>
            <h3 className="section-title mb-12" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} style={{ color: 'var(--accent)' }} /> Symptoms
            </h3>
            <div>
              <div className="detail-label">Reported</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {appointment.symptomForm.chiefComplaint || appointment.symptomForm.rawSymptoms}
              </p>
            </div>
          </motion.div>
        )}

        <div className="card mb-24" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} style={{ color: 'var(--accent)' }} /> Chat
            </h3>
            {chatStatus === 'ACTIVE' && (
              <button onClick={handleCloseChat} disabled={closingChat} className="btn btn-danger btn-sm">
                <XCircle size={13} /> {closingChat ? 'Closing...' : 'End Chat'}
              </button>
            )}
          </div>

          {chatStatus === 'NOT_STARTED' && messages.length === 0 ? (
            <div className="card-flat" style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                Chat will start once the doctor initiates the session.
              </p>
            </div>
          ) : (
            <div>
              {chatStatus === 'CLOSED' && (
                <div className="card-flat mb-12" style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  Chat session ended. Message transcript is preserved below.
                </div>
              )}
              <div className="chat-container">
                {messages.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 16, fontStyle: 'italic' }}>
                    No messages exchanged.
                  </div>
                ) : (
                  messages.map(m => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`chat-bubble ${isMe ? 'sent' : 'received'}`}>
                        <div className="chat-sender">{m.sender?.name}</div>
                        <p style={{ margin: 0 }}>{m.message}</p>
                        <span className="chat-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    );
                  })
                )}
              </div>
              {chatStatus === 'ACTIVE' && appointment.status === 'CONFIRMED' && (
                <form onSubmit={handleSendMessage} className="chat-input-row" style={{ marginTop: 12 }}>
                  <input type="text" className="input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                  <button type="submit" disabled={sendingMsg} className="btn btn-accent"><Send size={14} /></button>
                </form>
              )}
            </div>
          )}
        </div>

        {appointment.visitNote && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card mb-24" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={16} style={{ color: 'var(--success)' }} /> Visit Summary & Prescription
              </h3>
              <button onClick={() => generatePrescriptionPdf(appointment, 'PATIENT')} className="btn btn-ghost btn-sm">
                <Download size={13} /> PDF
              </button>
            </div>

            <div className="mb-20">
              <div className="detail-label">Summary</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {appointment.visitNote.patientSummary || appointment.visitNote.clinicalNotes}
              </p>
            </div>

            {Array.isArray(appointment.visitNote.prescription) && appointment.visitNote.prescription.length > 0 && (
              <div>
                <div className="detail-label mb-8">Prescribed Medications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {appointment.visitNote.prescription.map((med, idx) => (
                    <div key={idx} className="card-flat" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, color: 'var(--success)' }}>{med.drug}</strong>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{med.dose} · {med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {appointment.status === 'COMPLETED' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card mb-24" style={{ padding: 20, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.04)' }}>
            <h3 className="section-title mb-12" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24' }}>
              <Star size={16} fill="#fbbf24" /> Patient Recovery Outcome & CSAT Feedback
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              How was your consultation experience and recovery progress with {appointment.doctor?.user?.name || 'your doctor'}?
            </p>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Star size={24} fill={s <= (rating || appointment.rating || 5) ? '#fbbf24' : 'transparent'} color={s <= (rating || appointment.rating || 5) ? '#fbbf24' : '#6b7280'} />
                </button>
              ))}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginLeft: 8, alignSelf: 'center' }}>
                {rating || appointment.rating || 5} / 5 Stars
              </span>
            </div>

            <textarea
              className="input mb-14"
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share recovery progress notes or feedback for your doctor..."
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={handleRate}
                disabled={submittingRating}
                className="btn btn-primary btn-sm"
                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000' }}
              >
                {submittingRating ? 'Submitting...' : ratingSuccess ? 'Feedback Submitted' : 'Submit Recovery Feedback'}
              </button>
              {appointment.rating && !ratingSuccess && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Previous Rating: {appointment.rating}★</span>
              )}
            </div>
          </motion.div>
        )}

        <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Appointment">
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
            Cancel your appointment with {appointment.doctor?.user?.name}?
          </p>
          <textarea className="input mb-16" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)..." />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowCancelModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Keep</button>
            <button onClick={handleCancel} disabled={cancelling} className="btn btn-danger" style={{ flex: 1 }}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </Modal>

        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          appointment={appointment}
          onSuccess={fetchDetail}
        />
      </main>
    </div>
  );
}
