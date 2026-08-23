import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import Modal from '../../components/ui/Modal';
import { adminApi } from '../../api/admin.api';
import { Check, X, UserCheck } from 'lucide-react';

export default function PendingDoctors() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = () => {
    setLoading(true);
    adminApi.getPendingDoctors()
      .then(res => setPending(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveDoctor(id);
      fetchPending();
    } catch (err) {
      alert('Failed to approve doctor');
    }
  };

  const handleReject = async () => {
    if (!selectedDoctor) return;
    setProcessing(true);
    try {
      await adminApi.rejectDoctor(selectedDoctor.id, rejectReason);
      setShowRejectModal(false);
      fetchPending();
    } catch (err) {
      alert('Failed to reject doctor');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-main" style={{ maxWidth: 1100 }}>
        <div className="page-header">
          <h1>Doctor Registration Queue</h1>
          <p>Review doctor applications before granting clinic access.</p>
        </div>

        {loading ? (
          <div className="loading-text">Loading queue...</div>
        ) : pending.length === 0 ? (
          <div className="card empty-state">
            <UserCheck size={36} />
            <h3>No pending registrations</h3>
            <p>No doctor accounts currently await review.</p>
          </div>
        ) : (
          <div className="card list-stack">
            {pending.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="list-item"
              >
                <div className="list-item-info">
                  <div className="avatar avatar-md">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{doc.user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {doc.specialisation} · {doc.slotDuration} mins slot
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Email: {doc.user?.email} · Applied: {new Date(doc.user?.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="list-item-actions">
                  <button
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setShowRejectModal(true);
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(doc.id)}
                    className="btn btn-accent btn-sm"
                  >
                    <Check size={14} /> Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Doctor Application">
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Provide rejection feedback for {selectedDoctor?.user?.name}:
          </p>
          <textarea
            className="input mb-20"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowRejectModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleReject} disabled={processing} className="btn btn-danger" style={{ flex: 1 }}>
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
