import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import UrgencyBadge from '../../components/ui/UrgencyBadge';
import Modal from '../../components/ui/Modal';
import { doctorsApi } from '../../api/doctors.api';
import { calendarApi } from '../../api/calendar.api';
import DrugLookupModal from '../../components/doctor/DrugLookupModal';
import { Calendar, User, Clock, CheckCircle2, ChevronRight, ShieldAlert, Star, Search } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiPending, setApiPending] = useState(false);

  const ratedAppts = appointments.filter(a => a.rating);
  const avgRating = ratedAppts.length ? (ratedAppts.reduce((sum, a) => sum + a.rating, 0) / ratedAppts.length).toFixed(1) : '5.0';

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDrugLookup, setShowDrugLookup] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveMsg, setLeaveMsg] = useState('');
  const [leaveErr, setLeaveErr] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      doctorsApi.getDoctorAppointments().catch(err => {
        if (err.response?.data?.approvalStatus === 'PENDING' || err.response?.status === 403) setApiPending(true);
        return { data: [] };
      }),
      doctorsApi.getMyLeaveRequests().catch(() => ({ data: [] }))
    ]).then(([apptsRes, leavesRes]) => {
      setAppointments(apptsRes.data || []);
      setLeaveRequests(leavesRes.data || []);
    }).finally(() => setLoading(false));
  };

  const handleConnectCalendar = async () => {
    try { const res = await calendarApi.getAuthUrl(); window.location.href = res.data.url; }
    catch (err) { alert('Failed to connect Google Calendar'); }
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    setLeaveMsg(''); setLeaveErr(''); setSubmittingLeave(true);
    try {
      await doctorsApi.requestLeave(leaveDate, leaveReason);
      setLeaveMsg('Leave request submitted.');
      setLeaveDate(''); setLeaveReason('');
      fetchData();
      setTimeout(() => { setShowLeaveModal(false); setLeaveMsg(''); }, 1800);
    } catch (err) {
      setLeaveErr(err.response?.data?.error || 'Failed to submit leave request');
    } finally { setSubmittingLeave(false); }
  };

  const isPending = user?.approvalStatus === 'PENDING' || user?.doctorProfile?.approvalStatus === 'PENDING' || apiPending;

  if (isPending) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="page-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: 40, maxWidth: 480, textAlign: 'center', borderTop: '3px solid var(--warning)' }}>
            <ShieldAlert size={32} style={{ color: 'var(--warning)', marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Account Pending Approval</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Your doctor profile is being reviewed by administration. Access to schedules and consultations is restricted until approval.
            </p>
            <div className="card-flat" style={{ padding: '10px 16px', fontSize: 12, color: 'var(--warning)' }}>
              Please contact the clinic administrator.
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1050 }}>
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Welcome, {user?.name}</h1>
              <p>Your appointment schedule and patient briefings.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDrugLookup(true)} className="btn btn-secondary">
                <Search size={15} /> Drug Reference
              </button>
              <button onClick={() => setShowLeaveModal(true)} className="btn btn-ghost">
                <Calendar size={15} /> Request Leave
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-24" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={22} fill="#fbbf24" color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Patient CSAT Score: {avgRating} / 5.0</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Based on {ratedAppts.length} patient recovery feedback reviews</div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>
            {appointments.filter(a => a.status === 'COMPLETED').length} Visits Completed
          </div>
        </div>

        {!user?.hasGcalConnected && (
          <div className="card mb-24" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderLeft: '3px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Sync with Google Calendar</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Add patient appointments to your schedule.</div>
              </div>
            </div>
            <button onClick={handleConnectCalendar} className="btn btn-ghost btn-sm">Connect</button>
          </div>
        )}

        {leaveRequests.length > 0 && (
          <div className="card mb-24" style={{ padding: 20 }}>
            <h3 className="section-title mb-12" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} style={{ color: 'var(--text-muted)' }} /> My Leave Requests
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {leaveRequests.map(lr => (
                <div key={lr.id} className="card-flat" style={{ padding: '8px 12px', fontSize: 12 }}>
                  <div style={{ fontWeight: 500 }}>{new Date(lr.date).toLocaleDateString('en-IN')}</div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{lr.reason || 'No reason'}</div>
                  <span className={`badge ${lr.status === 'APPROVED' ? 'badge-success' : lr.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                    {lr.status === 'PENDING' ? 'Pending' : lr.status === 'APPROVED' ? 'Approved' : 'Declined'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="section-title mb-12">Patient Schedule</h2>

        {loading ? (
          <div className="loading-text">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="card empty-state">
            <Calendar size={36} />
            <h3>No appointments scheduled</h3>
            <p>You currently have no patient appointments.</p>
          </div>
        ) : (
          <div className="card list-stack">
            {appointments.map((appt) => (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="list-item">
                <div className="list-item-info">
                  <div className="avatar avatar-md"><User size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{appt.patient?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <Clock size={12} /> {new Date(appt.startsAt).toLocaleString('en-IN')}
                    </div>
                    {appt.symptomForm?.chiefComplaint && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{appt.symptomForm.chiefComplaint}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className={`badge ${appt.status === 'CONFIRMED' ? 'badge-success' : appt.status === 'COMPLETED' ? 'badge-accent' : appt.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                    {appt.status}
                  </span>
                  {appt.symptomForm?.urgency && <UrgencyBadge level={appt.symptomForm.urgency} />}
                  <Link to={`/doctor/appointments/${appt.id}`} className="btn btn-ghost btn-sm">
                    Review <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Request Leave">
          {leaveErr && <div className="alert alert-danger mb-12">{leaveErr}</div>}
          {leaveMsg && <div className="alert alert-success mb-12"><CheckCircle2 size={14} /> {leaveMsg}</div>}
          <form onSubmit={handleRequestLeave}>
            <div className="form-group mb-12">
              <label className="label">Date</label>
              <input type="date" className="input" value={leaveDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setLeaveDate(e.target.value)} required />
            </div>
            <div className="form-group mb-20">
              <label className="label">Reason</label>
              <textarea className="input" rows={3} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Conference, personal leave..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={submittingLeave} className="btn btn-accent" style={{ flex: 1 }}>
                {submittingLeave ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </Modal>

        <DrugLookupModal isOpen={showDrugLookup} onClose={() => setShowDrugLookup(false)} />
      </main>
    </div>
  );
}
