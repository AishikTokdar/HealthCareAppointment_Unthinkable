import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import Modal from '../../components/ui/Modal';
import { adminApi } from '../../api/admin.api';
import { UserCheck, Check, X, Clock } from 'lucide-react';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 40, maxWidth: 1100 }}>
        <h1 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>Doctor Registration Queue</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Review doctor applications before granting clinic access.</p>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading queue...</div>
        ) : pending.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No doctor accounts currently pending review.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pending.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>Dr. {doc.user?.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--accent-cyan)', marginBottom: 6 }}>{doc.specialisation} • {doc.slotDuration} mins slot</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Email: {doc.user?.email} • Applied: {new Date(doc.user?.createdAt).toLocaleDateString('en-IN')}</p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setShowRejectModal(true);
                    }}
                    className="btn-danger"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(doc.id)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}
                  >
                    <Check size={16} /> Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Doctor Application">
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Provide rejection feedback for Dr. {selectedDoctor?.user?.name}:
          </p>
          <textarea
            className="input-field"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            style={{ marginBottom: 20 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowRejectModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleReject} disabled={processing} className="btn-danger" style={{ flex: 1 }}>
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
