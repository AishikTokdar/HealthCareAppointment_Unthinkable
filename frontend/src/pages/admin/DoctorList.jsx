import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import Modal from '../../components/ui/Modal';
import { adminApi } from '../../api/admin.api';
import { User, Trash2, UserPlus, CheckCircle, Check, X, Clock, Plus, Star } from 'lucide-react';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [addingLeave, setAddingLeave] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialisation: 'General Medicine', slotDuration: '30', bio: ''
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [selectedReq, setSelectedReq] = useState(null);
  const [showRejectLeaveModal, setShowRejectLeaveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingReq, setProcessingReq] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getAllDoctors(),
      adminApi.getPendingLeaveRequests().catch(() => ({ data: [] }))
    ]).then(([docsRes, leavesRes]) => {
      setDoctors(docsRes.data || []);
      setLeaveRequests(leavesRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !leaveDate) return;
    setAddingLeave(true);
    try {
      const res = await adminApi.addLeave(selectedDoctor.id, leaveDate, leaveReason);
      alert(`Leave recorded! ${res.data.affectedCount} appointments cancelled.`);
      setShowLeaveModal(false); setLeaveDate(''); setLeaveReason(''); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to record leave'); }
    finally { setAddingLeave(false); }
  };

  const handleRemoveLeave = async (doctorId, leaveId) => {
    try { await adminApi.removeLeave(doctorId, leaveId); fetchData(); }
    catch (err) { alert('Failed to remove leave'); }
  };

  const handleApproveLeaveRequest = async (reqId) => {
    try {
      const res = await adminApi.approveLeaveRequest(reqId);
      alert(`Leave approved! ${res.data.affectedCount} appointments cancelled.`);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to approve leave request'); }
  };

  const handleRejectLeaveRequest = async () => {
    if (!selectedReq) return;
    setProcessingReq(true);
    try {
      await adminApi.rejectLeaveRequest(selectedReq.id, rejectReason);
      alert('Leave request declined.');
      setShowRejectLeaveModal(false); setRejectReason(''); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to reject leave request'); }
    finally { setProcessingReq(false); }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setRegError(''); setRegSuccess(''); setRegSubmitting(true);
    try {
      await adminApi.createDoctor({ ...regForm, slotDuration: parseInt(regForm.slotDuration, 10) });
      setRegSuccess(`Doctor ${regForm.name} registered successfully!`);
      setRegForm({ name: '', email: '', password: '', phone: '', specialisation: 'General Medicine', slotDuration: '30', bio: '' });
      fetchData();
      setTimeout(() => { setShowRegisterModal(false); setRegSuccess(''); }, 1500);
    } catch (err) {
      const detailMsg = err.response?.data?.details?.length ? err.response.data.details.join(', ') : err.response?.data?.error || 'Failed to register doctor';
      setRegError(detailMsg);
    } finally { setRegSubmitting(false); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1100 }}>
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Manage Doctors & Registrations</h1>
              <p>Register new clinic doctors, approve leave requests, and manage profiles.</p>
            </div>
            <button onClick={() => setShowRegisterModal(true)} className="btn btn-accent">
              <UserPlus size={16} /> Register New Doctor
            </button>
          </div>
        </div>

        {leaveRequests.length > 0 && (
          <div className="card mb-32" style={{ padding: 24, borderTop: '3px solid var(--warning)' }}>
            <h2 className="section-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: 'var(--warning)' }} /> Leave Requests Queue ({leaveRequests.length})
            </h2>
            <div className="list-stack">
              {leaveRequests.map((req) => (
                <div key={req.id} className="card-flat" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{req.doctor?.user?.name}</h4>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Date: <strong style={{ color: 'var(--text-primary)' }}>{new Date(req.date).toLocaleDateString('en-IN')}</strong>
                    </span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reason: {req.reason || 'None provided'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSelectedReq(req); setShowRejectLeaveModal(true); }} className="btn btn-danger btn-sm">
                      <X size={14} /> Decline
                    </button>
                    <button onClick={() => handleApproveLeaveRequest(req.id)} className="btn btn-accent btn-sm">
                      <Check size={14} /> Approve Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-text">Loading doctor directory...</div>
        ) : (
          <div className="grid-auto">
            {doctors.map((doc) => {
              const cleanName = (doc.user?.name || '').replace(/^Dr\.?\s+/i, '');
              const initials = cleanName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
              const ratings = doc.appointments?.filter(a => a.rating) || [];
              const avgRating = ratings.length ? (ratings.reduce((sum, a) => sum + a.rating, 0) / ratings.length).toFixed(1) : null;

              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div className="avatar avatar-md avatar-circle" style={{ background: 'var(--bg-inset)' }}>
                      {initials}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{cleanName}</h3>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{doc.specialisation}</span>
                      <span className={`badge ${doc.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                        {doc.approvalStatus}
                      </span>
                    </div>
                  </div>

                  <div style={{ margin: '12px 0', padding: '10px 12px', background: 'rgba(245, 158, 11, 0.06)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={14} fill="#fbbf24" /> CSAT: {avgRating ? `${avgRating} / 5.0` : 'No Ratings Yet'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {ratings.length} Review{ratings.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    {ratings.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 90, overflowY: 'auto' }}>
                        {ratings.map(r => (
                          <div key={r.id} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border-color)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{r.patient?.name || 'Patient'}</strong>: {'★'.repeat(r.rating)} - "{r.feedback || 'No written text'}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-16">
                    <span className="detail-label">Scheduled Leave Days</span>
                    {doc.leaveDays && doc.leaveDays.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                        {doc.leaveDays.map((ld) => (
                          <div key={ld.id} className="card-flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', fontSize: 12 }}>
                            <span>{new Date(ld.date).toLocaleDateString('en-IN')}</span>
                            <button onClick={() => handleRemoveLeave(doc.id, ld.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginTop: 4, fontStyle: 'italic' }}>No leave scheduled</span>
                    )}
                  </div>

                  <button onClick={() => { setSelectedDoctor(doc); setShowLeaveModal(true); }} className="btn btn-ghost btn-full btn-sm">
                    <Plus size={14} /> Schedule Leave Day
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Clinic Doctor">
          {regError && <div className="alert alert-danger mb-16">{regError}</div>}
          {regSuccess && <div className="alert alert-success mb-16"><CheckCircle size={16} /> {regSuccess}</div>}

          <form onSubmit={handleCreateDoctor} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input type="text" className="input" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} placeholder="Aarav Patel" required />
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="label">Email</label>
                <input type="email" className="input" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input type="password" className="input" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="label">Phone</label>
                <input type="tel" className="input" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Specialisation</label>
                <select className="input" value={regForm.specialisation} onChange={(e) => setRegForm({ ...regForm, specialisation: e.target.value })}>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="ENT (Ear, Nose, Throat)">ENT (Ear, Nose, Throat)</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Ayurveda / AYUSH">Ayurveda / AYUSH</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Slot Duration (minutes)</label>
              <select className="input" value={regForm.slotDuration} onChange={(e) => setRegForm({ ...regForm, slotDuration: e.target.value })}>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Bio / Profile Summary</label>
              <textarea className="input" rows={2} value={regForm.bio} onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={regSubmitting} className="btn btn-accent" style={{ flex: 1 }}>
                {regSubmitting ? 'Registering...' : 'Register Doctor'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title={`Schedule Leave - ${selectedDoctor?.user?.name}`}>
          <form onSubmit={handleAddLeave}>
            <div className="form-group mb-16">
              <label className="label">Leave Date</label>
              <input type="date" className="input" value={leaveDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setLeaveDate(e.target.value)} required />
            </div>
            <div className="form-group mb-24">
              <label className="label">Reason (Optional)</label>
              <input type="text" className="input" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={addingLeave} className="btn btn-accent" style={{ flex: 1 }}>
                {addingLeave ? 'Scheduling...' : 'Save Leave'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showRejectLeaveModal} onClose={() => setShowRejectLeaveModal(false)} title="Decline Leave Request">
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Decline leave request for {selectedReq?.doctor?.user?.name} on {selectedReq ? new Date(selectedReq.date).toLocaleDateString('en-IN') : ''}?
          </p>
          <textarea className="input mb-20" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for declining..." />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowRejectLeaveModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleRejectLeaveRequest} disabled={processingReq} className="btn btn-danger" style={{ flex: 1 }}>
              {processingReq ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
