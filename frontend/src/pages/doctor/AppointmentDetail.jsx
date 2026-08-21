import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { ArrowLeft, User, Clock, AlertCircle, FileEdit, HelpCircle, CheckCircle2, MessageSquare, Send, Sparkles, CheckSquare, Play, XCircle, Circle, Download } from 'lucide-react';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Chat & Presence state
  const [chatStatus, setChatStatus] = useState('NOT_STARTED');
  const [isPatientOnline, setIsPatientOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [startingChat, setStartingChat] = useState(false);
  const [closingChat, setClosingChat] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [refiningAi, setRefiningAi] = useState(false);
  const [completingVisit, setCompletingVisit] = useState(false);

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
        setIsPatientOnline(!!res.data.isCounterpartOnline);
        if (res.data.messages) setMessages(res.data.messages);
      })
      .catch(() => {});
  };

  const handleStartChat = async () => {
    setStartingChat(true);
    try {
      await appointmentsApi.startChat(id);
      setChatStatus('ACTIVE');
      runHeartbeat();
    } catch (err) {
      alert('Failed to start chat session');
    } finally {
      setStartingChat(false);
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
      alert('Failed to close chat session');
    } finally {
      setClosingChat(false);
    }
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

  const handleAiRefine = async () => {
    if (!newMessage.trim()) {
      alert('Please type a draft doctor note first before refining with AI.');
      return;
    }
    setRefiningAi(true);
    try {
      const res = await appointmentsApi.aiRefineDraft(id, newMessage);
      setNewMessage(res.data.refinedText);
    } catch (err) {
      alert('AI Refinement failed. Please try again.');
    } finally {
      setRefiningAi(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Are you sure you want to mark this appointment as Completed?')) return;
    setCompletingVisit(true);
    try {
      await appointmentsApi.complete(id);
      alert('Appointment marked as Completed!');
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete appointment');
    } finally {
      setCompletingVisit(false);
    }
  };

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
          <div style={{ display: 'flex', gap: 12 }}>
            {appointment.visitNote && (
              <button
                onClick={() => generatePrescriptionPdf(appointment, 'DOCTOR')}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Download size={16} /> Export Clinical PDF
              </button>
            )}
            {appointment.status === 'CONFIRMED' && (
              <button onClick={handleMarkCompleted} disabled={completingVisit} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}>
                <CheckSquare size={16} /> {completingVisit ? 'Completing...' : 'Mark Visit Completed'}
              </button>
            )}
            {appointment.status !== 'COMPLETED' && (
              <Link to={`/doctor/visit/${appointment.id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileEdit size={16} /> Record Visit & Prescription
              </Link>
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
                color: 'var(--accent-cyan)'
              }}>
                <User size={30} />
              </div>
              <div>
                <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>{appointment.patient?.name}</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Email: {appointment.patient?.email} • Phone: {appointment.patient?.phone || 'N/A'}</p>
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
                background: isPatientOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: isPatientOnline ? 'var(--accent-emerald)' : 'var(--text-muted)',
                border: `1px solid ${isPatientOnline ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'}`
              }}>
                <Circle size={10} style={{ fill: isPatientOnline ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                Patient Status: {isPatientOnline ? 'Online' : 'Offline'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 32, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Slot Time</span>
              <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{new Date(appointment.startsAt).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</span>
              <strong style={{ fontSize: 14, color: appointment.status === 'COMPLETED' ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>{appointment.status}</strong>
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
              <AlertCircle size={20} style={{ color: 'var(--accent-cyan)' }} /> AI Symptom Triage Briefing (Doctor Only)
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

        <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={20} style={{ color: 'var(--accent-violet)' }} /> Consultation Chat Room
            </h3>

            {appointment.status === 'CONFIRMED' && (
              <div style={{ display: 'flex', gap: 10 }}>
                {chatStatus === 'NOT_STARTED' && (
                  <button onClick={handleStartChat} disabled={startingChat} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                    <Play size={14} /> {startingChat ? 'Initiating...' : 'Start Chat'}
                  </button>
                )}
                {chatStatus === 'ACTIVE' && (
                  <button onClick={handleCloseChat} disabled={closingChat} className="btn-danger" style={{ padding: '8px 16px', fontSize: 13 }}>
                    <XCircle size={14} /> {closingChat ? 'Closing...' : 'Close Chat'}
                  </button>
                )}
              </div>
            )}
          </div>

          {chatStatus === 'NOT_STARTED' ? (
            <div style={{ background: 'var(--bg-surface)', padding: 24, textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Chat consultation has not been initiated. Review the patient's symptoms above and click <strong>"Start Chat"</strong> to open live consultation.
              </p>
              <button onClick={handleStartChat} disabled={startingChat} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Play size={16} /> Start Chat Consultation
              </button>
            </div>
          ) : chatStatus === 'CLOSED' ? (
            <div style={{ background: 'var(--bg-surface)', padding: 16, textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 14 }}>
              🔒 Chat consultation session has been closed.
            </div>
          ) : (
            <div>
              <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
                {messages.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                    Chat established! Send your first medical note or question below.
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

              <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type doctor instructions or clinical note in clean Indian English..."
                  />
                  <button
                    type="button"
                    onClick={handleAiRefine}
                    disabled={refiningAi}
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      background: 'rgba(124, 92, 252, 0.2)',
                      border: '1px solid var(--accent-violet)',
                      color: 'var(--accent-violet)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Sparkles size={14} /> {refiningAi ? 'Refining with Doctor AI...' : 'Refine with Doctor AI'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>💡 AI formats message in precise Indian English medical tone.</span>
                  <button type="submit" disabled={sendingMsg} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Send size={16} /> Send to Patient
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {appointment.visitNote && (
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)' }} /> Recorded Clinical Notes
              </h3>
              <button
                onClick={() => generatePrescriptionPdf(appointment, 'DOCTOR')}
                className="btn-primary"
                style={{ fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Export Clinical PDF
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{appointment.visitNote.clinicalNotes}</p>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Generated Patient Summary</h4>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)' }}>{appointment.visitNote.patientSummary}</p>
          </div>
        )}
      </main>
    </div>
  );
}
