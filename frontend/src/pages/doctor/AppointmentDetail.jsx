import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import { appointmentsApi } from '../../api/appointments.api';
import { generatePrescriptionPdf } from '../../utils/generatePrescriptionPdf';
import { ArrowLeft, User, AlertCircle, FileEdit, HelpCircle, CheckCircle2, MessageSquare, Send, Sparkles, CheckSquare, Play, XCircle, Download, History } from 'lucide-react';

import { cleanText } from '../../utils/cleanText';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chatStatus, setChatStatus] = useState('NOT_STARTED');
  const [isPatientOnline, setIsPatientOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [startingChat, setStartingChat] = useState(false);
  const [closingChat, setClosingChat] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [refiningAi, setRefiningAi] = useState(false);
  const [completingVisit, setCompletingVisit] = useState(false);
  const [fetchError, setFetchError] = useState('');

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
    appointmentsApi.heartbeat(id).then(res => {
      if (res.data.chatStatus) setChatStatus(res.data.chatStatus);
      setIsPatientOnline(!!res.data.isCounterpartOnline);
      if (res.data.messages) setMessages(res.data.messages);
    }).catch(() => {});
  };

  const handleStartChat = async () => {
    setStartingChat(true);
    try { await appointmentsApi.startChat(id); setChatStatus('ACTIVE'); runHeartbeat(); }
    catch { alert('Failed to start chat'); } finally { setStartingChat(false); }
  };

  const handleCloseChat = async () => {
    if (!window.confirm('End this chat session?')) return;
    setClosingChat(true);
    try { await appointmentsApi.closeChat(id); setChatStatus('CLOSED'); runHeartbeat(); }
    catch { alert('Failed to close chat'); } finally { setClosingChat(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    try { await appointmentsApi.sendMessage(id, newMessage); setNewMessage(''); runHeartbeat(); }
    catch { alert('Failed to send'); } finally { setSendingMsg(false); }
  };

  const handleAiRefine = async () => {
    if (!newMessage.trim()) { alert('Type a draft first.'); return; }
    setRefiningAi(true);
    try { const res = await appointmentsApi.aiRefineDraft(id, newMessage); setNewMessage(cleanText(res.data.refinedText)); }
    catch { alert('AI refinement failed.'); } finally { setRefiningAi(false); }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Mark this appointment as Completed?')) return;
    setCompletingVisit(true);
    try { await appointmentsApi.complete(id); alert('Marked as Completed.'); fetchDetail(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); } finally { setCompletingVisit(false); }
  };

  if (loading) return <div className="page-layout"><Sidebar /><main className="page-main"><div className="loading-text">Loading appointment details...</div></main></div>;

  if (fetchError || !appointment) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main" style={{ maxWidth: 800 }}>
          <button onClick={() => navigate('/doctor/dashboard')} className="back-link">
            <ArrowLeft size={14} /> Back to schedule
          </button>
          <div className="card" style={{ padding: 40, textAlign: 'center', borderTop: '3px solid var(--danger)' }}>
            <AlertCircle size={36} style={{ color: 'var(--danger)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Appointment Record Unavailable</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              {fetchError || 'This appointment record could not be found or you do not have permission to view it.'}
            </p>
            <button onClick={() => navigate('/doctor/dashboard')} className="btn btn-accent">
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
        <button onClick={() => navigate('/doctor/dashboard')} className="back-link"><ArrowLeft size={14} /> Back to schedule</button>

        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Patient Briefing</h1>
              <p>Patient: {appointment.patient?.name}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link to={`/doctor/patient-history/${appointment.patientId}`} className="btn btn-ghost btn-sm">
                <History size={14} /> History
              </Link>
              {appointment.visitNote && (
                <button onClick={() => generatePrescriptionPdf(appointment, 'DOCTOR')} className="btn btn-ghost btn-sm">
                  <Download size={14} /> PDF
                </button>
              )}
              {appointment.status === 'CONFIRMED' && (
                <button onClick={handleMarkCompleted} disabled={completingVisit} className="btn btn-ghost btn-sm" style={{ color: 'var(--success)', borderColor: 'rgba(110,200,122,0.2)' }}>
                  <CheckSquare size={14} /> {completingVisit ? 'Completing...' : 'Complete'}
                </button>
              )}
              {(appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') && (
                <Link to={`/doctor/visit/${appointment.id}`} className="btn btn-accent btn-sm">
                  <FileEdit size={14} /> Record Visit
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="card mb-24" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar avatar-lg"><User size={24} /></div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{appointment.patient?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{appointment.patient?.email} · {appointment.patient?.phone || 'N/A'}</div>
              </div>
            </div>
            {appointment.status === 'CONFIRMED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span className={`online-dot ${isPatientOnline ? 'online' : 'offline'}`} /> {isPatientOnline ? 'Online' : 'Offline'}
              </div>
            )}
          </div>
          <div className="detail-grid">
            <div><div className="detail-label">Time</div><div className="detail-value">{new Date(appointment.startsAt).toLocaleString('en-IN')}</div></div>
            <div><div className="detail-label">Status</div><div className="detail-value" style={{ color: appointment.status === 'COMPLETED' ? 'var(--success)' : 'var(--accent)' }}>{appointment.status}</div></div>
            {appointment.symptomForm?.urgency && <div><div className="detail-label">Urgency</div><UrgencyBadge level={appointment.symptomForm.urgency} /></div>}
          </div>
        </div>

        {appointment.symptomForm && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card mb-24" style={{ padding: 20 }}>
            <h3 className="section-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} style={{ color: 'var(--accent)' }} /> Symptom Briefing
            </h3>
            <div className="mb-16">
              <div className="detail-label">Chief Complaint</div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{appointment.symptomForm.chiefComplaint}</p>
            </div>
            <div className="mb-20">
              <div className="detail-label">Raw Symptoms</div>
              <div className="card-flat" style={{ padding: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{appointment.symptomForm.rawSymptoms}</div>
            </div>
            {appointment.symptomForm.suggestedQs?.length > 0 && (
              <div>
                <div className="detail-label mb-8">Suggested Questions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {appointment.symptomForm.suggestedQs.map((q, i) => (
                    <div key={i} className="card-flat" style={{ padding: '10px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HelpCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} /> {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="card mb-24" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} style={{ color: 'var(--accent)' }} /> Chat
            </h3>
            {appointment.status === 'CONFIRMED' && (
              <div style={{ display: 'flex', gap: 8 }}>
                {chatStatus === 'NOT_STARTED' && <button onClick={handleStartChat} disabled={startingChat} className="btn btn-accent btn-sm"><Play size={13} /> {startingChat ? 'Starting...' : 'Start Chat'}</button>}
                {chatStatus === 'ACTIVE' && <button onClick={handleCloseChat} disabled={closingChat} className="btn btn-danger btn-sm"><XCircle size={13} /> {closingChat ? 'Closing...' : 'End Chat'}</button>}
              </div>
            )}
          </div>

          {chatStatus === 'NOT_STARTED' && messages.length === 0 ? (
            <div className="card-flat" style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                Review symptoms above, then start the chat session.
              </p>
              {appointment.status === 'CONFIRMED' && (
                <button onClick={handleStartChat} disabled={startingChat} className="btn btn-accent btn-sm"><Play size={14} /> Start Chat</button>
              )}
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
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 16, fontStyle: 'italic' }}>No messages exchanged.</div>
                ) : messages.map(m => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`chat-bubble ${isMe ? 'sent' : 'received'}`}>
                      <div className="chat-sender">{m.sender?.name}</div>
                      <p style={{ margin: 0 }}>{m.message}</p>
                      <span className="chat-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>

              {chatStatus === 'ACTIVE' && (
                <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <textarea className="input" rows={3} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type clinical note or message..." />
                    <button type="button" onClick={handleAiRefine} disabled={refiningAi}
                      style={{ position: 'absolute', bottom: 8, right: 8, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}>
                      <Sparkles size={12} /> {refiningAi ? 'Refining...' : 'AI Refine'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={sendingMsg} className="btn btn-accent btn-sm"><Send size={14} /> Send</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {appointment.visitNote && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Clinical Notes
              </h3>
              <button onClick={() => generatePrescriptionPdf(appointment, 'DOCTOR')} className="btn btn-ghost btn-sm"><Download size={13} /> PDF</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{appointment.visitNote.clinicalNotes}</p>
            <div className="detail-label mb-4">Patient Summary</div>
            <div className="card-flat" style={{ padding: 12, fontSize: 13, color: 'var(--text-primary)' }}>{appointment.visitNote.patientSummary}</div>
          </div>
        )}
      </main>
    </div>
  );
}
