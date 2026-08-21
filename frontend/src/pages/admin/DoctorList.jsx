import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import Modal from '../../components/ui/Modal';
import { adminApi } from '../../api/admin.api';
import { Users, Calendar, Plus, User, Trash2 } from 'lucide-react';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [addingLeave, setAddingLeave] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    adminApi.getAllDoctors()
      .then(res => setDoctors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !leaveDate) return;
    setAddingLeave(true);
    try {
      const res = await adminApi.addLeave(selectedDoctor.id, leaveDate, leaveReason);
      alert(`Leave recorded! ${res.data.affectedCount} appointments cancelled and patients notified.`);
      setShowLeaveModal(false);
      setLeaveDate('');
      setLeaveReason('');
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record leave');
    } finally {
      setAddingLeave(false);
    }
  };

  const handleRemoveLeave = async (doctorId, leaveId) => {
    try {
      await adminApi.removeLeave(doctorId, leaveId);
      fetchDoctors();
    } catch (err) {
      alert('Failed to remove leave');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Manage Clinic Doctors & Leave</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Schedule doctor leave days and manage clinic schedules.</p>

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
                    <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Dr. {doc.user?.name}</h3>
                    <span style={{ fontSize: 13, color: 'var(--accent-cyan)' }}>{doc.specialisation}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Scheduled Leave Days</span>
                  {doc.leaveDays && doc.leaveDays.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {doc.leaveDays.map((ld) => (
                        <div key={ld.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                          <span>{new Date(ld.date).toLocaleDateString()}</span>
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
                  <Plus size={14} /> Schedule Leave Day
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title={`Schedule Leave - Dr. ${selectedDoctor?.user?.name}`}>
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
                placeholder="Personal leave, conference..."
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
      </main>
    </div>
  );
}
