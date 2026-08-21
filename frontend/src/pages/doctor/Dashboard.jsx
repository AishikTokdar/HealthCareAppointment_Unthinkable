import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import Modal from '../../components/ui/Modal';
import { doctorsApi } from '../../api/doctors.api';
import { calendarApi } from '../../api/calendar.api';
import { Calendar, User, Clock, CheckCircle2, ChevronRight, AlertCircle, ShieldAlert, Plus, Send } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiPending, setApiPending] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveMsg, setLeaveMsg] = useState('');
  const [leaveErr, setLeaveErr] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      doctorsApi.getDoctorAppointments().catch(err => {
        if (err.response?.data?.approvalStatus === 'PENDING' || err.response?.status === 403) {
          setApiPending(true);
        }
        return { data: [] };
      }),
      doctorsApi.getMyLeaveRequests().catch(() => ({ data: [] }))
    ])
      .then(([apptsRes, leavesRes]) => {
        setAppointments(apptsRes.data || []);
        setLeaveRequests(leavesRes.data || []);
      })
      .finally(() => setLoading(false));
  };

  const handleConnectCalendar = async () => {
    try {
      const res = await calendarApi.getAuthUrl();
      window.location.href = res.data.url;
    } catch (err) {
      alert('Failed to connect Google Calendar');
    }
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    setLeaveMsg('');
    setLeaveErr('');
    setSubmittingLeave(true);

    try {
      await doctorsApi.requestLeave(leaveDate, leaveReason);
      setLeaveMsg('Leave request submitted successfully! Pending admin approval.');
      setLeaveDate('');
      setLeaveReason('');
      fetchData();
      setTimeout(() => {
        setShowLeaveModal(false);
        setLeaveMsg('');
      }, 1800);
    } catch (err) {
      setLeaveErr(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const isPending = user?.approvalStatus === 'PENDING' || user?.doctorProfile?.approvalStatus === 'PENDING' || apiPending;

  if (isPending) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: 48, maxWidth: 540, textAlign: 'center', borderTop: '4px solid var(--accent-amber)' }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ShieldAlert size={36} />
            </div>
            <h2 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 12 }}>Account Pending Approval</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Your doctor profile registration is currently being reviewed by clinic administration. Access to clinical schedules, patient briefings, and consultations is restricted until approval.
            </p>
            <div style={{ background: 'var(--bg-surface)', padding: '14px 20px', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--accent-amber)', fontWeight: 500 }}>
              Please contact the clinic administrator to review and approve your account.
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 4 }}>
              Welcome, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Here is your clinical appointment schedule and pre-visit AI symptom briefings.</p>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 14 }}
          >
            <Calendar size={18} /> Request Leave
          </button>
        </div>

        {!user?.hasGcalConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              padding: 20,
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: '4px solid var(--accent-cyan)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Calendar size={28} style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Sync with Google Calendar</h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Automatically add your patient appointments to your personal schedule.</p>
              </div>
            </div>
            <button onClick={handleConnectCalendar} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
              Connect Now
            </button>
          </motion.div>
        )}

        {leaveRequests.length > 0 && (
          <div className="glass-card" style={{ padding: 20, marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} style={{ color: 'var(--accent-violet)' }} /> My Leave Requests
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {leaveRequests.map(lr => (
                <div key={lr.id} style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(lr.date).toLocaleDateString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lr.reason || 'No reason provided'}</div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    background: lr.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : lr.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: lr.status === 'APPROVED' ? 'var(--accent-emerald)' : lr.status === 'REJECTED' ? 'var(--accent-rose)' : 'var(--accent-amber)'
                  }}>
                    {lr.status === 'PENDING' ? 'Pending Admin Review' : lr.status === 'APPROVED' ? 'Approved' : 'Declined'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 16 }}>Patient Appointments Schedule</h2>

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
                      {new Date(appt.startsAt).toLocaleString('en-IN')}
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

        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Submit Leave Request">
          {leaveErr && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13 }}>
              {leaveErr}
            </div>
          )}
          {leaveMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} /> {leaveMsg}
            </div>
          )}

          <form onSubmit={handleRequestLeave}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Leave Date</label>
              <input
                type="date"
                className="input-field"
                value={leaveDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setLeaveDate(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Reason for Leave</label>
              <textarea
                className="input-field"
                rows={3}
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="E.g., Attending medical conference, personal family leave..."
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowLeaveModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={submittingLeave} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {submittingLeave ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
