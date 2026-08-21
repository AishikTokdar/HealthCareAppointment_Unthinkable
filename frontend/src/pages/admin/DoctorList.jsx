import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import Modal from '../../components/ui/Modal';
import { adminApi } from '../../api/admin.api';
import { Users, Calendar, Plus, User, Trash2, UserPlus, CheckCircle, Check, X, Clock } from 'lucide-react';

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
    name: '',
    email: '',
    password: '',
    phone: '',
    specialisation: 'General Medicine',
    slotDuration: '30',
    bio: ''
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [selectedReq, setSelectedReq] = useState(null);
  const [showRejectLeaveModal, setShowRejectLeaveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingReq, setProcessingReq] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getAllDoctors(),
      adminApi.getPendingLeaveRequests().catch(() => ({ data: [] }))
    ])
      .then(([docsRes, leavesRes]) => {
        setDoctors(docsRes.data || []);
        setLeaveRequests(leavesRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !leaveDate) return;
    setAddingLeave(true);
    try {
      const res = await adminApi.addLeave(selectedDoctor.id, leaveDate, leaveReason);
      alert(`Leave recorded! ${res.data.affectedCount} appointments cancelled. Notifications dispatched to doctor, admin, and patients.`);
      setShowLeaveModal(false);
      setLeaveDate('');
      setLeaveReason('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record leave');
    } finally {
      setAddingLeave(false);
    }
  };

  const handleRemoveLeave = async (doctorId, leaveId) => {
    try {
      await adminApi.removeLeave(doctorId, leaveId);
      fetchData();
    } catch (err) {
      alert('Failed to remove leave');
    }
  };

  const handleApproveLeaveRequest = async (reqId) => {
    try {
      const res = await adminApi.approveLeaveRequest(reqId);
      alert(`Leave request approved! ${res.data.affectedCount} patient appointments cancelled. Notifications sent to doctor, admin & patients.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve leave request');
    }
  };

  const handleRejectLeaveRequest = async () => {
    if (!selectedReq) return;
    setProcessingReq(true);
    try {
      await adminApi.rejectLeaveRequest(selectedReq.id, rejectReason);
      alert('Leave request declined and doctor notified.');
      setShowRejectLeaveModal(false);
      setRejectReason('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject leave request');
    } finally {
      setProcessingReq(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegSubmitting(true);

    try {
      await adminApi.createDoctor({
        ...regForm,
        slotDuration: parseInt(regForm.slotDuration, 10)
      });
      setRegSuccess(`Doctor ${regForm.name} registered and approved successfully!`);
      setRegForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialisation: 'General Medicine',
        slotDuration: '30',
        bio: ''
      });
      fetchData();
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess('');
      }, 1500);
    } catch (err) {
      const detailMsg = err.response?.data?.details?.length
        ? err.response.data.details.join(', ')
        : err.response?.data?.error || 'Failed to register doctor';
      setRegError(detailMsg);
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Manage Doctors & Registrations</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Register new clinic doctors, approve leave requests, and manage profiles.</p>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
          >
            <UserPlus size={18} /> Register New Doctor
          </button>
        </div>

        {leaveRequests.length > 0 && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 32, borderTop: '4px solid var(--accent-violet)' }}>
            <h2 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} style={{ color: 'var(--accent-violet)' }} /> Doctor Leave Requests Queue ({leaveRequests.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaveRequests.map((req) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <h4 style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{req.doctor?.user?.name}</h4>
                    <span style={{ fontSize: 13, color: 'var(--accent-cyan)', display: 'block', marginBottom: 4 }}>
                      Requested Leave Date: <strong>{new Date(req.date).toLocaleDateString('en-IN')}</strong>
                    </span>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reason: {req.reason || 'No reason provided'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setShowRejectLeaveModal(true);
                      }}
                      className="btn-danger"
                      style={{ fontSize: 13, padding: '6px 14px' }}
                    >
                      <X size={14} /> Decline
                    </button>
                    <button
                      onClick={() => handleApproveLeaveRequest(req.id)}
                      className="btn-primary"
                      style={{ fontSize: 13, padding: '6px 14px' }}
                    >
                      <Check size={14} /> Approve Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading doctor directory...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {doctors.map((doc) => (
              <motion.div key={doc.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-violet)'
                  }}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>{doc.user?.name}</h3>
                    <span style={{ fontSize: 13, color: 'var(--accent-cyan)' }}>{doc.specialisation}</span>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status: {doc.approvalStatus}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Scheduled Leave Days</span>
                  {doc.leaveDays && doc.leaveDays.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {doc.leaveDays.map((ld) => (
                        <div key={ld.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                          <span>{new Date(ld.date).toLocaleDateString('en-IN')}</span>
                          <button onClick={() => handleRemoveLeave(doc.id, ld.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>No leave scheduled</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setShowLeaveModal(true);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: 13, padding: '8px 12px' }}
                >
                  <Plus size={14} /> Schedule Leave Day Directly
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Clinic Doctor">
          {regError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13 }}>
              {regError}
            </div>
          )}
          {regSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} /> {regSuccess}
            </div>
          )}

          <form onSubmit={handleCreateDoctor} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Full Name</label>
              <input
                type="text"
                className="input-field"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                placeholder="Aarav Patel"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="doctor@clinic.in"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Phone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Specialisation</label>
                <select
                  className="input-field"
                  value={regForm.specialisation}
                  onChange={(e) => setRegForm({ ...regForm, specialisation: e.target.value })}
                >
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

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Slot Duration (minutes)</label>
              <select
                className="input-field"
                value={regForm.slotDuration}
                onChange={(e) => setRegForm({ ...regForm, slotDuration: e.target.value })}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Bio / Profile Summary</label>
              <textarea
                className="input-field"
                rows={2}
                value={regForm.bio}
                onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                placeholder="Senior Consultant Physician with 10+ years clinical experience..."
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={regSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {regSubmitting ? 'Registering...' : 'Register Doctor'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title={`Schedule Leave - ${selectedDoctor?.user?.name}`}>
          <form onSubmit={handleAddLeave}>
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
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Reason (Optional)</label>
              <input
                type="text"
                className="input-field"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Personal leave, medical conference..."
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowLeaveModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={addingLeave} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {addingLeave ? 'Scheduling...' : 'Save Leave Day'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showRejectLeaveModal} onClose={() => setShowRejectLeaveModal(false)} title="Decline Doctor Leave Request">
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Decline leave request for {selectedReq?.doctor?.user?.name} on {selectedReq ? new Date(selectedReq.date).toLocaleDateString('en-IN') : ''}?
          </p>
          <textarea
            className="input-field"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for declining leave (optional)..."
            style={{ marginBottom: 20 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowRejectLeaveModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleRejectLeaveRequest} disabled={processingReq} className="btn-danger" style={{ flex: 1 }}>
              {processingReq ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
